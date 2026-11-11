#!/usr/bin/env python3
"""
Athena 16-channel screen test suite: spot position, colour response, flicker-frequency response.

Setup: headband ~10 cm in front of the bottom of the monitor, detectors facing the screen, right way up, full
screen brightness. Open  http://localhost:8765/tools/screen_suite.html  in a browser on that monitor (keep the tab
in front), then run from your own Terminal (Bluetooth permission):
    python tools/athena_screen_suite_test.py [--preset p1042]

Stages (all synced through tools/flash_t0.json):
  1. SPOT   a white dot (12 % of screen height) hops across the bottom strip, 21 positions, left->right then right->left
            -> per-channel response vs screen x = where each sensor sits
  2. COLOUR full-screen red / green / blue / white, 4 s each (black between)
  3. FREQ   full-screen white flicker at ~1, 2, 4, 8, 15, 30 Hz (frame-locked; peak frequency is read from the data)
"""
import argparse, asyncio, json, sys, time
from pathlib import Path
import numpy as np
from bleak import BleakClient

sys.path.insert(0, str(Path(__file__).parent))
from athena_preset_sweep import CONTROL, DATA, DATA2, encode, parse, start_preset  # noqa: E402
from athena_screen_flash_test import find_muse  # noqa: E402

T0_FILE = Path(__file__).parent / "flash_t0.json"
LEAD = 20.0
SPOT_Y, SPOT_SIZE, SPOT_DUR = 0.88, 0.12, 2.2
XS = [round(0.02 + 0.048 * i, 3) for i in range(21)]
FREQS = [1, 2, 4, 8, 15, 30]
FS = 64.0


def build_schedule():
    S = []

    def add(label, dur, **kw):
        S.append(dict(label=label, dur=dur, **kw))

    add("black_start", 4, kind="solid", color="#000")
    for p, order in (("LR", XS), ("RL", XS[::-1])):
        for i, x in enumerate(order):
            add(f"spot_{p}_{i:02d}", SPOT_DUR, kind="dot", x=x, y=SPOT_Y, size=SPOT_SIZE)
    add("black_a", 3, kind="solid", color="#000")
    for name, col in (("red", "#f00"), ("green", "#0f0"), ("blue", "#00f"), ("white", "#fff")):
        add(f"col_{name}", 4, kind="solid", color=col)
        add(f"black_{name}", 3, kind="solid", color="#000")
    for f in FREQS:
        add(f"freq_{f}", 6, kind="flicker", color="#fff", hz=f)
        add(f"black_f{f}", 2, kind="solid", color="#000")
    return S


def window(t, X, a, b, lo=0.7, hi=0.3):
    m = (t >= a + lo) & (t < b - hi)
    return m


def bars(v):
    chars = " ▁▂▃▄▅▆▇█"
    mx = max(v.max(), 1e-9)
    return "".join(chars[int(max(0, x) / mx * 8)] for x in v)


def analyse(t, X, sched, preset):
    starts, a = {}, 0.0
    for s in sched:
        starts[s["label"]] = (a, a + s["dur"]); a += s["dur"]

    def mean_of(label, lo=0.7, hi=0.3):
        a, b = starts[label]
        m = window(t, X, a, b, lo, hi)
        return X[m].mean(axis=0), X[m].std(axis=0), int(m.sum())

    base, base_sd, _ = mean_of("black_start", 1.0, 0.3)
    base = (base + mean_of("black_a")[0]) / 2

    # ---- SPOT ----
    prof = {"LR": [], "RL": []}
    for p in prof:
        for i in range(len(XS)):
            prof[p].append(mean_of(f"spot_{p}_{i:02d}")[0] - base)
    LR, RL = np.array(prof["LR"]), np.array(prof["RL"])[::-1]       # RL re-ordered to increasing x
    avg = (LR + RL) / 2
    xs = np.array(XS)
    print("\n=== SPOT: response vs dot position (screen x 0=left .. 1=right) ===")
    print("ch   max-resp  peak-x  centroid  fwhm   LR/RL-peak   profile (x: left -> right)")
    rows = []
    for c in range(16):
        prof_c = avg[:, c]
        sm = np.convolve(np.pad(prof_c, 1, mode="edge"), np.ones(3) / 3, mode="valid")
        k = int(np.argmax(sm)); mx = sm[k]
        responsive = mx > max(80.0, 6 * base_sd[c])
        if not responsive:
            rows.append((c, mx, None)); continue
        thr = 0.3 * mx
        w = np.clip(sm - thr, 0, None)
        cen = float((w * xs).sum() / w.sum())
        half = mx / 2
        l = k
        while l > 0 and sm[l] > half: l -= 1
        r = k
        while r < len(sm) - 1 and sm[r] > half: r += 1
        fwhm = xs[r] - xs[l]
        pk_lr, pk_rl = xs[int(np.argmax(LR[:, c]))], xs[int(np.argmax(RL[:, c]))]
        rows.append((c, mx, (xs[k], cen, fwhm, pk_lr, pk_rl, bars(np.clip(prof_c, 0, None)))))
    for c, mx, info in rows:
        if info is None:
            print(f"{c:>2}  {mx:>8.0f}   (no clear response)")
        else:
            pk, cen, fw, a, b, bar = info
            print(f"{c:>2}  {mx:>8.0f}   {pk:>5.2f}   {cen:>6.2f}   {fw:>5.2f}   {a:.2f}/{b:.2f}   {bar}")
    resp = sorted([(info[1], c) for c, mx, info in rows if info is not None])
    print("\nLeft -> right order by centroid:", "  ".join(f"ch{c}({x:.2f})" for x, c in resp))

    # ---- COLOUR ----
    print("\n=== COLOUR: mean change vs black (counts) ===")
    blacks = np.mean([mean_of(n)[0] for n in ("black_red", "black_green", "black_blue", "black_white", "black_a")], axis=0)
    cols = {n: mean_of(f"col_{n}", 1.0, 0.5)[0] - blacks for n in ("red", "green", "blue", "white")}
    print("ch      red     green      blue     white    R:G:B (norm to max)")
    for c in range(16):
        v = np.array([cols["red"][c], cols["green"][c], cols["blue"][c]])
        if abs(cols["white"][c]) < 60 and np.abs(v).max() < 60:
            print(f"{c:>2} {cols['red'][c]:>8.0f} {cols['green'][c]:>9.0f} {cols['blue'][c]:>9.0f} {cols['white'][c]:>9.0f}    (flat)")
            continue
        if np.abs(v).max() < 60:
            print(f"{c:>2} {cols['red'][c]:>8.0f} {cols['green'][c]:>9.0f} {cols['blue'][c]:>9.0f} {cols['white'][c]:>9.0f}    (white only)")
            continue
        n = v / max(np.abs(v).max(), 1e-9)
        print(f"{c:>2} {cols['red'][c]:>8.0f} {cols['green'][c]:>9.0f} {cols['blue'][c]:>9.0f} {cols['white'][c]:>9.0f}    {n[0]:+.2f} : {n[1]:+.2f} : {n[2]:+.2f}")

    # ---- FREQ ----
    print("\n=== FREQ: amplitude (counts) at the detected flicker peak ===")
    det, amps = {}, {}
    for f in FREQS:
        a, b = starts[f"freq_{f}"]
        m = window(t, X, a, b, 1.0, 0.5)
        seg = X[m] - X[m].mean(axis=0)
        w = np.hanning(len(seg))
        P = np.abs(np.fft.rfft(seg * w[:, None], axis=0))
        fr = np.fft.rfftfreq(len(seg), 1 / FS)
        band = (fr >= 0.7) & (fr <= 32)
        tot = P[band].sum(axis=1)
        k = np.where(band)[0][int(np.argmax(tot))]
        det[f] = fr[k]
        amps[f] = 2 * P[k] / w.sum()
    print("nominal Hz     " + "  ".join(f"{f:>7}" for f in FREQS))
    print("detected Hz    " + "  ".join(f"{det[f]:>7.2f}" for f in FREQS))
    for c in range(16):
        print(f"ch{c:>2}           " + "  ".join(f"{amps[f][c]:>7.0f}" for f in FREQS))
    return dict(base=base.tolist(), spot_avg=avg.tolist(), xs=XS)


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preset", default="p1042")
    ap.add_argument("--out", default="athena_screen_suite.json")
    args = ap.parse_args()
    T0_FILE.unlink(missing_ok=True)
    sched = build_schedule()
    total = sum(s["dur"] for s in sched)
    samples = []

    def on_optics(tag, cols):
        if len(cols) == 16:
            samples.append((time.time(), [c[0] for c in cols]))

    dev = await find_muse()
    async with BleakClient(dev) as client:
        await client.start_notify(CONTROL, lambda *_: None)
        await client.start_notify(DATA, lambda _, d: parse(bytes(d), on_optics))
        try:
            await client.start_notify(DATA2, lambda _, d: parse(bytes(d), on_optics))
        except Exception:
            pass
        await client.write_gatt_char(CONTROL, encode("v1"), response=False)
        await asyncio.sleep(0.5)
        await start_preset(client, args.preset, first=True)
        await asyncio.sleep(3)
        if not samples:
            sys.exit(f"No 16-channel optics data on {args.preset}.")
        t0 = time.time() + LEAD
        T0_FILE.write_text(json.dumps({"t0_ms": int(t0 * 1000), "schedule": sched}))
        print(f"Streaming OK. Suite starts in {LEAD:.0f} s and runs {total:.0f} s. Keep the screen tab in front; don't touch the headband.")
        await asyncio.sleep(LEAD + total + 2)
        try:
            await client.stop_notify(DATA)
        except Exception:
            pass
    T0_FILE.unlink(missing_ok=True)
    t = np.array([s[0] for s in samples]) - t0
    X = np.array([s[1] for s in samples], float)
    print(f"Captured {len(t)} samples ({len(t) / (t[-1] - t[0]):.1f} Hz)")
    res = analyse(t, X, sched, args.preset)
    Path(args.out).write_text(json.dumps(dict(t=t.tolist(), X=X.tolist(), schedule=sched, result=res)))
    print(f"\nSaved {args.out}")


if __name__ == "__main__":
    asyncio.run(main())
