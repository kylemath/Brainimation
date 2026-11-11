#!/usr/bin/env python3
"""
Athena 16-channel ambient-light test: which raw optical channels respond to a monitor going white <-> black?

Put the headband (sensors facing the screen, ~5-10 cm) in front of a monitor at full brightness, open
    http://localhost:8765/tools/screen_flash.html
in a browser on that monitor, then run this script from your own Terminal (needs Bluetooth permission):
    python tools/athena_screen_flash_test.py [--preset p1042]

The script connects, starts the stream, writes tools/flash_t0.json (the page polls it) and records while the
page runs the schedule  black 8s, white 8s, black 8s, white 8s, 1 Hz flash 10s, black 8s.
It then reports, per channel, mean raw counts in black vs white (edges trimmed), the white-black delta, and the
1 Hz lock-in amplitude during the flash block. A channel that follows the screen measures ambient light.
"""
import argparse, asyncio, json, sys, time
from pathlib import Path
import numpy as np
from bleak import BleakClient, BleakScanner

sys.path.insert(0, str(Path(__file__).parent))
from athena_preset_sweep import CONTROL, DATA, DATA2, encode, parse, start_preset  # noqa: E402

BLOCKS = [("black", 8), ("white", 8), ("black", 8), ("white", 8), ("flash", 10), ("black", 8)]
T0_FILE = Path(__file__).parent / "flash_t0.json"
LEAD = 30.0       # seconds between "stream running" and t0 (time to position the headband)
TRIM = 1.5        # seconds trimmed from each block edge


async def find_muse(timeout=12):
    print(f"Scanning {timeout}s for a Muse...")
    devs = await BleakScanner.discover(timeout=timeout, return_adv=True)
    muses = [(d, a.rssi) for d, a in devs.values() if d.name and "muse" in d.name.lower()]
    if not muses:
        sys.exit("No Muse found.")
    muses.sort(key=lambda t: -t[1])
    print("Found", muses[0][0].name)
    return muses[0][0]


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preset", default="p1042")
    ap.add_argument("--out", default="athena_screen_flash.json")
    args = ap.parse_args()

    T0_FILE.unlink(missing_ok=True)
    samples = []  # (t_wall, [16 values])

    def on_optics(tag, cols):
        if len(cols) == 16:
            samples.append((time.time(), [c[0] for c in cols]))

    def handler(_, data):
        parse(bytes(data), on_optics)

    dev = await find_muse()
    async with BleakClient(dev) as client:
        await client.start_notify(CONTROL, lambda *_: None)
        await client.start_notify(DATA, handler)
        try:
            await client.start_notify(DATA2, handler)
        except Exception:
            pass
        await client.write_gatt_char(CONTROL, encode("v1"), response=False)
        await asyncio.sleep(0.5)
        await start_preset(client, args.preset, first=True)
        await asyncio.sleep(3)
        if not samples:
            sys.exit(f"No 16-channel optics data on {args.preset}. Is it the 16-channel preset (p1041/p1042)?")
        t0 = time.time() + LEAD
        T0_FILE.write_text(json.dumps({"t0_ms": int(t0 * 1000)}))
        total = sum(b[1] for b in BLOCKS)
        print(f"Streaming OK ({len(samples)} samples). Screen flash starts in {LEAD:.0f} s - position the headband in front of the monitor NOW.")
        await asyncio.sleep(LEAD + total + 2)
        await client.stop_notify(DATA)
    T0_FILE.unlink(missing_ok=True)

    t = np.array([s[0] for s in samples]) - t0
    X = np.array([s[1] for s in samples], float)
    print(f"\nCaptured {len(t)} samples ({len(t) / (t[-1] - t[0]):.1f} Hz)")

    # block windows
    wins, start = [], 0.0
    for kind, ln in BLOCKS:
        wins.append((kind, start, start + ln)); start += ln

    def block_mean(kind):
        vals = []
        for k, a, b in wins:
            if k == kind:
                m = (t >= a + TRIM) & (t < b - TRIM)
                if m.sum() > 10:
                    vals.append(X[m].mean(axis=0))
        return np.mean(vals, axis=0)

    black, white = block_mean("black"), block_mean("white")
    fa, fb = [(a, b) for k, a, b in wins if k == "flash"][0]
    m = (t >= fa) & (t < fb)
    sq = np.where(np.floor((t[m] - fa) / 0.5) % 2 == 0, 1.0, -1.0)
    flash_amp = np.array([2 * abs(np.mean((X[m, c] - X[m, c].mean()) * sq)) for c in range(16)])

    print("\n ch   black      white      delta     delta%   1Hz-amp   verdict")
    for c in range(16):
        d = white[c] - black[c]
        pct = 100 * d / black[c] if black[c] else 0
        resp = abs(d) > 30 and abs(pct) > 0.2
        print(f"{c:>3} {black[c]:>9.0f} {white[c]:>9.0f} {d:>9.0f} {pct:>8.2f} {flash_amp[c]:>9.1f}   {'FOLLOWS SCREEN' if resp else '-'}")
    Path(args.out).write_text(json.dumps({"t": t.tolist(), "X": X.tolist(), "blocks": BLOCKS}))
    print(f"\nSaved {args.out}")


if __name__ == "__main__":
    asyncio.run(main())
