/**
 * muse-browser.js — Zero-Dependency Two-Phase WebBluetooth GATT Client for InteraXon Muse (2016, Muse 2, Muse S)
 *
 * Resolves the Muse 2 / Muse S "lazy GATT characteristic advertisement" firmware race condition by:
 *   Phase 1 (connect): Attaching to GATT service 0xFE8D and binding ONLY the Control characteristic (273e0001).
 *   Phase 2 (start):   Sequencing firmware wake ('v1'), preset ('p21'), and stream-start ('s'/'d') commands
 *                      with a 500 ms settle window BEFORE discovering and binding the 256 Hz EEG notification
 *                      characteristics (273e0003..273e0006: TP9, AF7, AF8, TP10).
 *
 * Exposes a drop-in `window.muse = { MuseClient, zipSamples }` API with lightweight zero-dependency
 * Observable/Subject streams (replacing 473.0 KB legacy muse-js + RxJS bundles).
 */
(function (global) {
  'use strict';

  const MUSE_SERVICE = 0xfe8d; // 65165
  const CONTROL_CHAR_UUID = '273e0001-4c4d-454d-96be-f03bac821358';
  const TELEMETRY_CHAR_UUID = '273e000b-4c4d-454d-96be-f03bac821358';
  const GYROSCOPE_CHAR_UUID = '273e0009-4c4d-454d-96be-f03bac821358';
  const ACCELEROMETER_CHAR_UUID = '273e000a-4c4d-454d-96be-f03bac821358';

  const EEG_UUIDS = [
    '273e0003-4c4d-454d-96be-f03bac821358', // Channel 0: TP9 (Left Temporal)
    '273e0004-4c4d-454d-96be-f03bac821358', // Channel 1: AF7 (Left Anterior Frontal)
    '273e0005-4c4d-454d-96be-f03bac821358', // Channel 2: AF8 (Right Anterior Frontal)
    '273e0006-4c4d-454d-96be-f03bac821358', // Channel 3: TP10 (Right Temporal)
    '273e0007-4c4d-454d-96be-f03bac821358'  // Channel 4: AUX (Right Auxiliary)
  ];

  const PPG_UUIDS = [
    '273e000f-4c4d-454d-96be-f03bac821358', // Ambient
    '273e0010-4c4d-454d-96be-f03bac821358', // Infrared
    '273e0011-4c4d-454d-96be-f03bac821358'  // Red
  ];

  const EEG_FREQUENCY = 256;
  const EEG_SAMPLES_PER_READING = 12;
  const PPG_FREQUENCY = 64;
  const PPG_SAMPLES_PER_READING = 6;
  const CHANNEL_NAMES = ['TP9', 'AF7', 'AF8', 'TP10', 'AUX'];
  const PPG_CHANNEL_NAMES = ['ambient', 'infrared', 'red'];

  /**
   * Minimal RxJS-compatible Subject for zero-dependency reactive streaming.
   */
  class SimpleSubject {
    constructor() {
      this._listeners = new Set();
    }

    subscribe(observerOrNext, errorFn, completeFn) {
      const listener = typeof observerOrNext === 'function'
        ? { next: observerOrNext, error: errorFn || null, complete: completeFn || null }
        : (observerOrNext || {});
      this._listeners.add(listener);
      return {
        unsubscribe: () => {
          this._listeners.delete(listener);
        }
      };
    }

    next(value) {
      for (const listener of Array.from(this._listeners)) {
        if (typeof listener.next === 'function') {
          try {
            listener.next(value);
          } catch (err) {
            console.error('[muse-browser] Observer error:', err);
          }
        }
      }
    }

    complete() {
      for (const listener of Array.from(this._listeners)) {
        if (typeof listener.complete === 'function') {
          listener.complete();
        }
      }
      this._listeners.clear();
    }
  }

  /**
   * Minimal RxJS-compatible BehaviorSubject that emits its current value upon subscription.
   */
  class BehaviorSubject extends SimpleSubject {
    constructor(initialValue) {
      super();
      this._value = initialValue;
    }

    get value() {
      return this._value;
    }

    subscribe(observerOrNext, errorFn, completeFn) {
      const sub = super.subscribe(observerOrNext, errorFn, completeFn);
      const fn = typeof observerOrNext === 'function' ? observerOrNext : (observerOrNext && observerOrNext.next);
      if (typeof fn === 'function') {
        try {
          fn(this._value);
        } catch (err) {
          console.error('[muse-browser] BehaviorSubject initial emit error:', err);
        }
      }
      return sub;
    }

    next(value) {
      this._value = value;
      super.next(value);
    }
  }

  /**
   * Encode an ASCII control command as a length-prefixed byte array terminated by newline (0x0A).
   * Format: [cmd.length + 1, ...charCodes, 0x0a]
   */
  function encodeCommand(cmd) {
    const encoded = new Uint8Array(cmd.length + 2);
    encoded[0] = cmd.length + 1;
    for (let i = 0; i < cmd.length; i++) {
      encoded[i + 1] = cmd.charCodeAt(i);
    }
    encoded[cmd.length + 1] = 0x0a;
    return encoded;
  }

  /**
   * Decode twelve packed 12-bit unsigned offset-binary EEG samples from an 18-byte payload (bytes 2..19).
   * Scale factor: 1000 / 2048 = 0.48828125 uV per LSB centered at 2048 (0x800).
   * Equation (1): V_i = 0.48828125 * (s_i - 2048) uV
   */
  function decodeEEGSamples(bytes) {
    const samples = new Array(12);
    for (let i = 0; i < 12; i++) {
      const byteOffset = Math.floor(i * 1.5);
      let raw12;
      if (i % 2 === 0) {
        raw12 = (bytes[byteOffset] << 4) | (bytes[byteOffset + 1] >> 4);
      } else {
        raw12 = ((bytes[byteOffset] & 0x0f) << 8) | bytes[byteOffset + 1];
      }
      samples[i] = 0.48828125 * (raw12 - 2048);
    }
    return samples;
  }

  /**
   * Decode six packed 24-bit unsigned PPG samples from an 18-byte payload.
   */
  function decodePPGSamples(bytes) {
    const samples = new Array(6);
    for (let i = 0; i < 6; i++) {
      const b = i * 3;
      samples[i] = (bytes[b] << 16) | (bytes[b + 1] << 8) | bytes[b + 2];
    }
    return samples;
  }

  /**
   * Decode Muse telemetry notification packet (battery, fuel gauge, ADC voltage, temperature).
   */
  function decodeTelemetry(dataView) {
    return {
      sequenceId: dataView.getUint16(0),
      batteryLevel: dataView.getUint16(2) / 512.0,
      fuelGaugeVoltage: dataView.getUint16(4) * 2.2,
      adcVoltage: dataView.getUint16(6),
      temperature: dataView.getUint16(8)
    };
  }

  /**
   * Decode 3-axis accelerometer or gyroscope notification packet.
   */
  function decodeImuPacket(dataView, scale) {
    const samples = [];
    for (let ofs = 2; ofs <= 14; ofs += 6) {
      samples.push({
        x: dataView.getInt16(ofs) * scale,
        y: dataView.getInt16(ofs + 2) * scale,
        z: dataView.getInt16(ofs + 4) * scale
      });
    }
    return {
      sequenceId: dataView.getUint16(0),
      samples: samples
    };
  }

  /**
   * Synchronize multi-channel 12-sample EEG readings across TP9, AF7, AF8, and TP10 by packet index.
   */
  function zipSamples(eegReadingsSubject) {
    const out = new SimpleSubject();
    const pendingByIndex = new Map();

    eegReadingsSubject.subscribe((reading) => {
      const ch = typeof reading.electrode === 'number'
        ? reading.electrode
        : CHANNEL_NAMES.indexOf(reading.electrode);
      if (ch < 0 || ch >= 4) return;

      const idx = reading.index;
      if (!pendingByIndex.has(idx)) {
        pendingByIndex.set(idx, {
          packets: [null, null, null, null],
          timestamp: reading.timestamp
        });
      }
      const entry = pendingByIndex.get(idx);
      entry.packets[ch] = reading.samples;

      if (entry.packets[0] && entry.packets[1] && entry.packets[2] && entry.packets[3]) {
        pendingByIndex.delete(idx);
        const dt = 1000.0 / EEG_FREQUENCY;
        for (let s = 0; s < EEG_SAMPLES_PER_READING; s++) {
          out.next({
            index: idx,
            timestamp: entry.timestamp + s * dt,
            data: [
              entry.packets[0][s],
              entry.packets[1][s],
              entry.packets[2][s],
              entry.packets[3][s]
            ]
          });
        }
      }

      // Bound map size if packets drop
      if (pendingByIndex.size > 64) {
        const oldestKey = pendingByIndex.keys().next().value;
        pendingByIndex.delete(oldestKey);
      }
    });

    return out;
  }

  /**
   * Two-Phase Lazy-GATT Muse WebBluetooth Client.
   */
  class MuseClient {
    constructor() {
      this.enableAux = false;
      this.enablePpg = false;
      this.deviceName = '';
      this.gatt = null;
      this.service = null;
      this.controlChar = null;
      this.eegCharacteristics = [];
      this.ppgCharacteristics = [];
      this.lastIndex = null;
      this.lastTimestamp = null;
      this._controlBuffer = '';
      this._gattQueue = Promise.resolve();
      this._boundListeners = [];

      // Reactive streams
      this.connectionStatus = new BehaviorSubject(false);
      this.eegReadings = new SimpleSubject();
      this.ppgReadings = new SimpleSubject();
      this.telemetryData = new SimpleSubject();
      this.accelerometerData = new SimpleSubject();
      this.gyroscopeData = new SimpleSubject();
      this.controlResponses = new SimpleSubject();
      this.eventMarkers = new SimpleSubject();
    }

    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Serialize GATT operations on the single-flight WebBluetooth peripheral queue
     * and retry transient 'GATT operation already in progress' / discovery errors.
     */
    _enqueueGatt(fn, retries = 3, backoffMs = 120) {
      const runWithRetry = async () => {
        let lastErr;
        for (let attempt = 0; attempt < retries; attempt++) {
          try {
            return await fn();
          } catch (err) {
            lastErr = err;
            await this.delay(backoffMs * (attempt + 1));
          }
        }
        throw lastErr;
      };
      const next = this._gattQueue.then(runWithRetry, runWithRetry);
      this._gattQueue = next.catch(() => {});
      return next;
    }

    _addCharListener(char, handler) {
      char.addEventListener('characteristicvaluechanged', handler);
      this._boundListeners.push({ char, handler });
    }

    _cleanupListeners() {
      for (const { char, handler } of this._boundListeners) {
        try {
          char.removeEventListener('characteristicvaluechanged', handler);
        } catch (_) {}
      }
      this._boundListeners = [];
      this.eegCharacteristics = [];
      this.ppgCharacteristics = [];
      this.controlChar = null;
      this._controlBuffer = '';
    }

    /**
     * Phase 1: Connect to GATT service 0xFE8D and bind ONLY the Control characteristic (273e0001).
     * Avoids eager querying of 273e0003..0006 before firmware preset commands are sent.
     */
    async connect(gatt) {
      this._cleanupListeners();
      if (gatt) {
        this.gatt = gatt;
      } else {
        const device = await navigator.bluetooth.requestDevice({
          filters: [{ services: [MUSE_SERVICE] }]
        });
        this.gatt = await device.gatt.connect();
      }

      this.deviceName = (this.gatt.device && this.gatt.device.name) || 'Muse';
      this.service = await this._enqueueGatt(() => this.gatt.getPrimaryService(MUSE_SERVICE));

      // Listen for unexpected GATT disconnection
      if (this.gatt.device) {
        this.gatt.device.addEventListener('gattserverdisconnected', () => {
          this._cleanupListeners();
          this.gatt = null;
          this.service = null;
          this.connectionStatus.next(false);
        }, { once: true });
      }

      // Phase 1: Bind ONLY Control characteristic (273e0001)
      this.controlChar = await this._enqueueGatt(() => this.service.getCharacteristic(CONTROL_CHAR_UUID));
      await this._enqueueGatt(() => this.controlChar.startNotifications());
      this._addCharListener(this.controlChar, (event) => {
        const dv = event.target.value;
        const bytes = new Uint8Array(dv.buffer, dv.byteOffset, dv.byteLength);
        const len = bytes[0];
        let str = '';
        for (let i = 1; i <= len && i < bytes.length; i++) {
          str += String.fromCharCode(bytes[i]);
        }
        this._controlBuffer += str;
        // Prevent unbounded buffer growth if malformed text arrives
        if (this._controlBuffer.length > 4096) {
          this._controlBuffer = this._controlBuffer.slice(-1024);
        }
        const startIdx = this._controlBuffer.indexOf('{');
        const endIdx = this._controlBuffer.indexOf('}');
        if (startIdx !== -1 && endIdx > startIdx) {
          const jsonCandidate = this._controlBuffer.slice(startIdx, endIdx + 1);
          this._controlBuffer = this._controlBuffer.slice(endIdx + 1);
          try {
            this.controlResponses.next(JSON.parse(jsonCandidate));
          } catch (_) {
            // Ignore partial JSON fragment
          }
        }
      });

      this.connectionStatus.next(true);
    }

    async sendCommand(cmd) {
      if (!this.controlChar) {
        throw new Error('Muse Control characteristic (273e0001) is not connected.');
      }
      const payload = encodeCommand(cmd);
      await this._enqueueGatt(async () => {
        if (typeof this.controlChar.writeValueWithoutResponse === 'function') {
          await this.controlChar.writeValueWithoutResponse(payload);
        } else {
          await this.controlChar.writeValue(payload);
        }
      });
    }

    /**
     * Phase 2: Wake firmware with 'v1', select preset ('p21'), start stream ('s'),
     * wait 500 ms for lazy GATT table update, and bind 256 Hz EEG characteristics (273e0003..0006).
     */
    async start() {
      if (!this.service || !this.controlChar) {
        throw new Error('Call connect() before start().');
      }

      // Step 1: Halt any residual stream and query firmware version
      await this.pause();
      await this.delay(100);
      await this.sendCommand('v1');
      await this.delay(100);

      // Step 2: Select EEG preset ('p21' = 4-ch EEG without PPG; 'p50' = EEG + PPG; 'p20' = 5-ch w/ AUX)
      let preset = 'p21';
      if (this.enablePpg) {
        preset = 'p50';
      } else if (this.enableAux) {
        preset = 'p20';
      }
      await this.sendCommand(preset);
      await this.delay(100);

      // Step 3: Send stream-start ('s') and resume ('d') to trigger GATT characteristic advertisement
      await this.sendCommand('s');
      await this.delay(100);
      await this.resume();

      // Step 4: Settle delay for Muse 2 / Muse S firmware to expose EEG UUIDs in GATT table
      await this.delay(500);

      // Step 5: Discover and bind 256 Hz EEG characteristics (273e0003..273e0006)
      this.eegCharacteristics = [];
      const channelCount = this.enableAux ? 5 : 4;
      let boundChars = [];

      try {
        const allChars = await this._enqueueGatt(() => this.service.getCharacteristics(), 2, 150);
        const byUuid = new Map(allChars.map((c) => [c.uuid.toLowerCase(), c]));
        for (let ch = 0; ch < channelCount; ch++) {
          const target = byUuid.get(EEG_UUIDS[ch]);
          if (target) boundChars.push({ ch, char: target });
        }
      } catch (_) {
        // Fallback to per-UUID lookup if getCharacteristics() is restricted
      }

      if (boundChars.length === 0) {
        for (let ch = 0; ch < channelCount; ch++) {
          try {
            const char = await this._enqueueGatt(() => this.service.getCharacteristic(EEG_UUIDS[ch]), 3, 200);
            boundChars.push({ ch, char });
          } catch (err) {
            console.warn(`[muse-browser] EEG channel ${CHANNEL_NAMES[ch]} unavailable:`, err.message);
          }
        }
      }

      for (const { ch, char } of boundChars) {
        await this._enqueueGatt(() => char.startNotifications(), 3, 150);
        this._addCharListener(char, (event) => {
          const dataView = event.target.value;
          const eventIndex = dataView.getUint16(0);
          const payload = new Uint8Array(dataView.buffer, dataView.byteOffset + 2, 18);
          const samples = decodeEEGSamples(payload);
          const timestamp = this.getTimestamp(eventIndex, EEG_SAMPLES_PER_READING, EEG_FREQUENCY);
          this.eegReadings.next({
            electrode: ch,
            channelName: CHANNEL_NAMES[ch],
            index: eventIndex,
            samples: samples,
            timestamp: timestamp
          });
        });
        this.eegCharacteristics.push(char);
      }

      // Optional non-fatal binding for Telemetry and Accelerometer (skipped gracefully on Muse 2016)
      try {
        const telemChar = await this._enqueueGatt(() => this.service.getCharacteristic(TELEMETRY_CHAR_UUID), 1, 50);
        await this._enqueueGatt(() => telemChar.startNotifications(), 2, 100);
        this._addCharListener(telemChar, (event) => {
          this.telemetryData.next(decodeTelemetry(event.target.value));
        });
      } catch (_) {}

      try {
        const accelChar = await this._enqueueGatt(() => this.service.getCharacteristic(ACCELEROMETER_CHAR_UUID), 1, 50);
        await this._enqueueGatt(() => accelChar.startNotifications(), 2, 100);
        this._addCharListener(accelChar, (event) => {
          this.accelerometerData.next(decodeImuPacket(event.target.value, 0.0000610352));
        });
      } catch (_) {}

      if (this.enablePpg) {
        this.ppgCharacteristics = [];
        for (let p = 0; p < PPG_UUIDS.length; p++) {
          try {
            const ppgChar = await this._enqueueGatt(() => this.service.getCharacteristic(PPG_UUIDS[p]), 2, 100);
            await this._enqueueGatt(() => ppgChar.startNotifications(), 2, 100);
            this._addCharListener(ppgChar, (event) => {
              const dv = event.target.value;
              const idx = dv.getUint16(0);
              const bytes = new Uint8Array(dv.buffer, dv.byteOffset + 2, 18);
              this.ppgReadings.next({
                index: idx,
                ppgChannel: p,
                samples: decodePPGSamples(bytes),
                timestamp: this.getTimestamp(idx, PPG_SAMPLES_PER_READING, PPG_FREQUENCY)
              });
            });
            this.ppgCharacteristics.push(ppgChar);
          } catch (_) {}
        }
      }
    }

    async pause() {
      await this.sendCommand('h');
    }

    async resume() {
      await this.sendCommand('d');
    }

    async deviceInfo() {
      await this.sendCommand('v1');
    }

    async injectMarker(value, timestamp = Date.now()) {
      this.eventMarkers.next({ value, timestamp });
    }

    disconnect() {
      this._cleanupListeners();
      if (this.gatt) {
        this.lastIndex = null;
        this.lastTimestamp = null;
        try {
          this.gatt.disconnect();
        } catch (_) {}
        this.gatt = null;
        this.service = null;
        this.connectionStatus.next(false);
      }
    }

    getTimestamp(eventIndex, samplesPerReading, frequency) {
      const readingDelta = 1000.0 * (1.0 / frequency) * samplesPerReading;
      if (this.lastIndex === null || this.lastTimestamp === null) {
        this.lastIndex = eventIndex;
        this.lastTimestamp = Date.now() - readingDelta;
      }
      while (this.lastIndex - eventIndex > 4096) {
        eventIndex += 65536;
      }
      if (eventIndex === this.lastIndex) {
        return this.lastTimestamp;
      }
      if (eventIndex > this.lastIndex) {
        this.lastTimestamp += readingDelta * (eventIndex - this.lastIndex);
        this.lastIndex = eventIndex;
        return this.lastTimestamp;
      }
      return this.lastTimestamp - readingDelta * (this.lastIndex - eventIndex);
    }
  }

  global.muse = {
    MuseClient: MuseClient,
    zipSamples: zipSamples,
    decodeEEGSamples: decodeEEGSamples,
    encodeCommand: encodeCommand,
    MUSE_SERVICE: MUSE_SERVICE,
    EEG_FREQUENCY: EEG_FREQUENCY,
    EEG_SAMPLES_PER_READING: EEG_SAMPLES_PER_READING,
    channelNames: CHANNEL_NAMES,
    ppgChannelNames: PPG_CHANNEL_NAMES
  };

  console.log('✅ Zero-dependency Two-Phase Muse WebBluetooth client (muse-browser.js) loaded!');
})(typeof window !== 'undefined' ? window : globalThis);
