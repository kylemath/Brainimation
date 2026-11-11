#!/usr/bin/env python3
"""
Muse S Athena optics preset sweep (standalone, BLE via bleak).

Connects to an Athena, steps through optics presets, records each one while you sit still
with the headband ON, and scores every raw optical channel (no wavelength labels applied):

    DC      mean raw counts            PI %   band-passed pulse amplitude / DC
    SNR     0.7-3 Hz peak vs 3.5-12 Hz median noise floor
    class   G good (SNR>20 dB & PI>0.1%)  c clipped/flat (big DC, PI<0.05%)  d dark (DC<2000)  n noisy
    rail    fraction of samples sitting at that channel's max value (saturation tell)

Protocol is ported from muse-browser.js (tags 0x34/0x35/0x36 = 4/8/16 optics channels, 20-bit LSB-first).

Run it from your OWN Terminal (macOS grants Bluetooth permission to Terminal; sandboxed apps get killed):
    python tools/athena_preset_sweep.py                    # all presets, 5 s settle + 10 s record each
    python tools/athena_preset_sweep.py --presets p1041 p1042 --record 15
Close any BrainImation browser tab that is connected to the headband first (one BLE client at a time).
Results are also written to athena_sweep_results.json (per-channel metrics + raw samples).
"""
import argparse, asyncio, json, sys, time
import numpy as np
from bleak import BleakClient, BleakScanner

CONTROL = "273e0001-4c4d-454d-96be-f03bac821358"
DATA = "273e0013-4c4d-454d-96be-f03bac821358"
DATA2 = "273e0014-4c4d-454d-96be-f03bac821358"
FS = 64.0
ALL_PRESETS = ["p1041", "p1042", "p1043", "p1044", "p1034", "p1035", "p1045", "p1046", "p4129"]

# tag -> (type, channels, samples, bytes)
TAGS = {
    0x11: ("eeg", 4, 4, 28), 0x12: ("eeg", 8, 2, 28),
    0x34: ("optics", 4, 3, 30), 0x35: ("optics", 8, 2, 40), 0x36: ("optics", 16, 1, 40),
    0x47: ("motion", 6, 3, 36), 0x53: ("drlref", 2, 6, 24),
    0x88: ("battery", 1, 1, 20), 0x98: ("battery", 1, 1, 20),
}
VARIABLE = {0x88}
PACKET_HDR, SUB_HDR = 9, 5


def encode(cmd: str) -> bytes:
    return bytes([len(cmd) + 1]) + cmd.encode() + b"\n"


def unpack_le(buf: bytes, offset: int, count: int, bits: int):
    big = int.from_bytes(buf[offset: offset + (count * bits + 7) // 8], "little")
    mask = (1 << bits) - 1
    return [(big >> (i * bits)) & mask for i in range(count)]


def parse(buf: bytes, on_optics, on_tag=None):
    """Walk a notification, call on_optics(tag, channels_by_index) for each optics subpacket."""
    off = 0
    while off < len(buf):
        length = buf[off]
        if length < PACKET_HDR + SUB_HDR or off + length > len(buf):
            break
        end = off + length
        i = off + PACKET_HDR
        while i + SUB_HDR <= end:
            tag = buf[i]
            spec = TAGS.get(tag)
            if not spec:
                break
            typ, ch, ns, nbytes = spec
            if on_tag:
                on_tag(tag)
            p = i + SUB_HDR
            if tag in VARIABLE:
                fixed = p + nbytes
                i = fixed if (fixed <= end and (fixed == end or buf[fixed] in TAGS)) else end
                continue
            if p + nbytes > end:
                break
            if typ == "optics":
                vals = unpack_le(buf, p, ch * ns, 20)
                cols = [[vals[s * ch + c] for s in range(ns)] for c in range(ch)]
                on_optics(tag, cols)
            i = p + nbytes
        off = end


def analyse(x: np.ndarray):
    x = np.asarray(x, float)
    n = len(x)
    if n < 256:
        return dict(cls="n", dc=0.0, pi=0.0, snr=0.0, rail=0.0, hr=0.0, n=n)
    dc = x.mean()
    w = 96
    cs = np.concatenate([[0], np.cumsum(x)])
    idx = np.arange(n)
    a, b = np.maximum(0, idx - w // 2), np.minimum(n, idx + w // 2)
    hp = x - (cs[b] - cs[a]) / (b - a)
    sm = (np.roll(hp, 1) + hp + np.roll(hp, -1)) / 3
    pi = 100 * (sm.max() - sm.min()) / abs(dc) if abs(dc) > 1 else 0.0
    d = (x - dc) * np.hanning(n)
    P = np.abs(np.fft.rfft(d)) ** 2
    f = np.fft.rfftfreq(n, 1 / FS)
    card = (f >= 0.7) & (f <= 3.0)
    floor = (f >= 3.5) & (f <= 12.0)
    pk = P[card].max()
    snr = 10 * np.log10((pk + 1e-9) / (np.median(P[floor]) + 1e-9))
    hr = f[card][np.argmax(P[card])]
    rail = float(np.mean(x >= x.max())) if x.max() > 0 else 0.0
    cls = "n"
    if abs(dc) < 2000:
        cls = "d"
    elif pi < 0.05 and abs(dc) > 1e5:
        cls = "c"
    elif snr > 20 and pi > 0.1:
        cls = "G"
    return dict(cls=cls, dc=float(dc), pi=float(pi), snr=float(snr), rail=rail, hr=float(hr), n=n)


class Recorder:
    def __init__(self):
        self.reset()

    def reset(self):
        self.chans = {}  # channel -> list
        self.tags = set()
        self.t0 = time.time()
        self.notifs = 0
        self.all_tags = {}

    def tag(self, t):
        self.all_tags[t] = self.all_tags.get(t, 0) + 1

    def __call__(self, tag, cols):
        self.tags.add(tag)
        for c, vals in enumerate(cols):
            self.chans.setdefault(c, []).extend(vals)


async def find_muse(timeout=12):
    print(f"Scanning {timeout}s for a Muse...")
    devs = await BleakScanner.discover(timeout=timeout, return_adv=True)
    muses = [(d, a.rssi) for d, a in devs.values() if d.name and "muse" in d.name.lower()]
    if not muses:
        sys.exit("No Muse found. Turn it on, wake it, and close other apps/tabs connected to it.")
    muses.sort(key=lambda t: -t[1])
    d, rssi = muses[0]
    print(f"Found {d.name} ({d.address}) rssi={rssi}")
    return d


async def send(client, cmd, delay):
    await client.write_gatt_char(CONTROL, encode(cmd), response=False)
    await asyncio.sleep(delay)


async def start_preset(client, preset, first):
    seq = ([("v6", .2), ("s", .2)] if first else []) + [("h", .2), (preset, .2), ("s", .2),
                                                          ("dc001", .05), ("dc001", .1), ("L1", .3), ("s", .2)]
    for cmd, delay in seq:
        await send(client, cmd, delay)


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--presets", nargs="+", default=ALL_PRESETS)
    ap.add_argument("--settle", type=float, default=5)
    ap.add_argument("--record", type=float, default=10)
    ap.add_argument("--out", default="athena_sweep_results.json")
    args = ap.parse_args()

    dev = await find_muse()
    rec = Recorder()
    results = {}

    def handler(_, data: bytearray):
        rec.notifs += 1
        parse(bytes(data), rec, rec.tag)

    async with BleakClient(dev) as client:
        print("Connected. Keep the headband ON your forehead and sit still.\n")
        # Diagnostics: what does the headband expose?
        for svc in client.services:
            if "273e" in svc.uuid.lower() or "fe8d" in svc.uuid.lower():
                print(f"   service {svc.uuid}")
                for ch in svc.characteristics:
                    print(f"     {ch.uuid[:8]}  props={','.join(ch.properties)}")
        print()
        # Like the browser client: enable notifications on the CONTROL characteristic first, and show its replies
        ctrl_buf = {"s": ""}

        def ctrl_handler(_, data: bytearray):
            b = bytes(data)
            txt = b[1:1 + b[0]].decode(errors="replace") if b else ""
            ctrl_buf["s"] += txt
            while "{" in ctrl_buf["s"] and "}" in ctrl_buf["s"]:
                i, j = ctrl_buf["s"].index("{"), ctrl_buf["s"].index("}")
                if j < i:
                    ctrl_buf["s"] = ctrl_buf["s"][j + 1:]
                    continue
                print("   [control reply]", ctrl_buf["s"][i:j + 1][:160])
                ctrl_buf["s"] = ctrl_buf["s"][j + 1:]

        await client.start_notify(CONTROL, ctrl_handler)
        await client.start_notify(DATA, handler)
        try:
            await client.start_notify(DATA2, handler)
        except Exception:
            pass
        await send(client, "v1", 0.5)   # device info request (shows whether commands are accepted)
        for k, preset in enumerate(args.presets):
            if not client.is_connected:
                print("!! headband disconnected - stopping. Close other apps/tabs using it and retry.")
                break
            print(f"== {preset}: switching...", flush=True)
            rec.reset()
            try:
                await start_preset(client, preset, first=(k == 0))
                waited = 0.0
                while rec.notifs == 0 and waited < 3:
                    await asyncio.sleep(0.25); waited += 0.25
                if rec.notifs == 0:
                    print("   no data after handshake - sending 'd' (classic start) ...")
                    await send(client, "d", 0.5)
                await asyncio.sleep(args.settle)
            except Exception as e:
                print(f"!! {type(e).__name__}: {e}  (connection lost?) - stopping sweep")
                break
            rec.reset()
            await asyncio.sleep(args.record)
            n = len(rec.chans)
            metrics = {c: analyse(np.array(v[-int(FS * args.record):])) for c, v in rec.chans.items()}
            strip = "".join(metrics[c]["cls"] for c in sorted(metrics))
            rate = np.mean([len(v) for v in rec.chans.values()]) / args.record if rec.chans else 0
            good = [m for m in metrics.values() if m["cls"] == "G"]
            results[preset] = dict(
                optics_channels=n, tags=sorted(hex(t) for t in rec.tags), sample_rate=rate, strip=strip,
                metrics={str(c): m for c, m in metrics.items()},
                raw={str(c): v[-int(FS * args.record):] for c, v in rec.chans.items()},
            )
            print(f"   notifications={rec.notifs} all_tags={ {hex(t): c for t, c in rec.all_tags.items()} }")
            print(f"   channels={n} tags={sorted(hex(t) for t in rec.tags)} rate={rate:.1f} Hz  good={len(good)}  strip={strip}")
            print("   ch    DC       PI%    SNR   HR(bpm)  rail  class")
            for c in sorted(metrics):
                m = metrics[c]
                print(f"   {c:>2} {m['dc']:>9.0f} {m['pi']:>7.2f} {m['snr']:>6.1f} {m['hr']*60:>7.0f} {m['rail']:>6.2f}   {m['cls']}")
            print()
        try:
            await client.stop_notify(DATA)
        except Exception:
            pass

    print("\nSUMMARY (ranked by good channels, then median SNR of good ones)")
    print(f"{'preset':8} {'ch':>3} {'good':>4} {'clip':>4} {'dark':>4} {'medSNR':>7}  strip")
    rows = []
    for p, r in results.items():
        ms = list(r["metrics"].values())
        g = [m for m in ms if m["cls"] == "G"]
        rows.append((len(g), float(np.median([m["snr"] for m in g])) if g else 0.0, p, r, ms))
    for ng, snr, p, r, ms in sorted(rows, key=lambda t: (-t[0], -t[1])):
        print(f"{p:8} {r['optics_channels']:>3} {ng:>4} {sum(m['cls']=='c' for m in ms):>4} "
              f"{sum(m['cls']=='d' for m in ms):>4} {snr:>7.1f}  {r['strip']}")
    with open(args.out, "w") as f:
        json.dump(results, f)
    print(f"\nSaved {args.out}")


if __name__ == "__main__":
    asyncio.run(main())
