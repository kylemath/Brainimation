#!/usr/bin/env python3
"""
Athena fine spot-position test (headband ~3 cm from the screen, detectors facing it, right way up).

  Stage 1  coarse 3x3 raster of a small white dot -> finds where the headband sits (best x, y)
  Stage 2  fine horizontal sweep (step 0.02 of screen width) along that height, left->right and right->left
           -> per-channel Gaussian fit = horizontal position of every responsive channel

Open  http://localhost:8765/tools/screen_suite.html  on the monitor (tab in front), then in your own Terminal:
    python tools/athena_spot_fine_test.py [--screen-cm 60]
"""
import argparse, asyncio, json, sys, time
from pathlib import Path
import numpy as np
from bleak import BleakClient

sys.path.insert(0, str(Path(__file__).parent))
from athena_preset_sweep import CONTROL, DATA, DATA2, encode, parse, start_preset  # noqa: E402
from athena_screen_flash_test import find_muse  # noqa: E402

T0_FILE = Path(__file__).parent / "flash_t0.json"
LEAD = 45.0
DOT = 0.045            # dot diameter as a fraction of screen height
STEP = 0.02
HALF = 0.30            # sweep +-HALF around the best x


def write_stage(sched, delay):
    t0 = time.time() + delay
    T0_FILE.write_text(json.dumps({"t0_ms": int(t0 * 1000), "schedule": sched}))
    return t0


def stage1_schedule():
    S = [dict(label="black_s1", dur=3.0, kind="solid", color="#000")]
    for y in (0.62, 0.77, 0.92):
        for x in (0.30, 0.45, 0.60):
            S.append(dict(label=f"r_{x:.2f}_{y:.2f}", dur=1.7, kind="dot", x=x, y=y, size=DOT))
    S.append(dict(label="black_e1", dur=1.0, kind="solid", color="#000"))
    return S


def stage2_schedule(xc, y):
    lo, hi = max(0.02, xc - HALF), min(0.98, xc + HALF)
    xs = [round(v, 3) for v in np.arange(lo, hi + 1e-9, STEP)]
    S = [dict(label="black_s2", dur=3.0, kind="solid", color="#000")]
    for p, order in (("LR", xs), ("RL", xs[::-1])):
        for i, x in enumerate(order):
            S.append(dict(label=f"sp_{p}_{i:02d}", dur=1.8, kind="dot", x=x, y=y, size=DOT))
    S.append(dict(label="black_e2", dur=1.0, kind="solid", color="#000"))
    return S, xs


def spans(sched):
    d, a = {}, 0.0
    for s in sched:
        d[s["label"]] = (a, a + s["dur"]); a += s["dur"]
    return d


def wmean(t, X, t0, span, lo=0.6, hi=0.2):
    a, b = span
    m = (t >= t0 + a + lo) & (t < t0 + b - hi)
    return X[m].mean(axis=0), X[m].std(axis=0)


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preset", default="p1042")
    ap.add_argument("--screen-cm", type=float, default=0.0, help="screen width in cm (to print distances)")
    ap.add_argument("--out", default="athena_spot_fine.json")
    args = ap.parse_args()
    T0_FILE.unlink(missing_ok=True)
    samples = []

    def on_optics(tag, cols):
        if len(cols) == 16:
            samples.append((time.time(), [c[0] for c in cols]))

    def snapshot():
        return np.array([s[0] for s in samples]), np.array([s[1] for s in samples], float)

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

        # ---------------- stage 1 ----------------
        s1 = stage1_schedule(); sp1 = spans(s1); L1 = sum(s["dur"] for s in s1)
        t0_1 = write_stage(s1, LEAD)
        print(f"Streaming OK. Stage 1 (coarse raster) starts in {LEAD:.0f} s. Hold the headband ~3 cm from the screen, don't touch it.")
        await asyncio.sleep(LEAD + L1 + 0.8)
        t, X = snapshot(); t = t - 0
        base, _ = wmean(t, X, t0_1, sp1["black_s1"], 1.0, 0.2)
        best, bestv = None, -1
        strong = [4, 5, 6, 7, 2, 3]
        for lab, sp in sp1.items():
            if lab.startswith("r_"):
                v = np.abs(wmean(t, X, t0_1, sp)[0] - base)[strong].sum()
                _, xx, yy = lab.split("_")
                print(f"   raster x={xx} y={yy}  response(sum ch2-7) = {v:,.0f}")
                if v > bestv: bestv, best = v, (float(xx), float(yy))
        if bestv < 3000:
            print("!! Almost no response in stage 1 - is the headband in front of the dot area, detectors facing the screen?")
        xc, y = best
        print(f"Best spot x={xc:.2f} y={y:.2f}  -> fine sweep around it.")

        # ---------------- stage 2 ----------------
        s2, xs = stage2_schedule(xc, y); sp2 = spans(s2); L2 = sum(s["dur"] for s in s2)
        t0_2 = write_stage(s2, 3.0)
        print(f"Stage 2: {len(xs)} positions x 2 passes, {L2:.0f} s.")
        await asyncio.sleep(3.0 + L2 + 1.0)
        try:
            await client.stop_notify(DATA)
        except Exception:
            pass
    T0_FILE.unlink(missing_ok=True)
    t, X = snapshot()
    print(f"Captured {len(t)} samples. max raw = {X.max():,.0f}" + ("  (!! near full scale: some channels may clip)" if X.max() > 1.03e6 else ""))

    base, bsd = wmean(t, X, t0_2, sp2["black_s2"], 1.0, 0.2)
    base = (base + wmean(t, X, t0_2, sp2["black_e2"], 0.3, 0.1)[0]) / 2
    xs_a = np.array(xs)
    LR = np.array([wmean(t, X, t0_2, sp2[f"sp_LR_{i:02d}"])[0] - base for i in range(len(xs))])
    RL = np.array([wmean(t, X, t0_2, sp2[f"sp_RL_{i:02d}"])[0] - base for i in range(len(xs))])[::-1]

    def gfit(y):
        k = int(np.argmax(y)); mx = y[k]
        m = y > 0.35 * mx
        if m.sum() < 4:
            return None
        p = np.polyfit(xs_a[m], np.log(y[m]), 2)
        if p[0] >= 0:
            return None
        return -p[1] / (2 * p[0]), float(np.sqrt(-1 / (2 * p[0])))

    print("\n=== FINE SPOT FIT: horizontal position of each channel (screen width = 1) ===")
    print("ch  sign   peak-resp   centre(LR)  centre(RL)   centre   sigma   profile")
    cent = {}
    for c in range(16):
        prof = (LR[:, c] + RL[:, c]) / 2
        sgn = 1 if prof.max() >= -prof.min() else -1
        amp = (sgn * prof).max()
        if amp < max(80.0, 6 * bsd[c]):
            print(f"{c:>2}   -     {amp:>8.0f}   (no clear response)")
            continue
        fl = gfit(np.clip(sgn * LR[:, c], 1e-3, None)); fr = gfit(np.clip(sgn * RL[:, c], 1e-3, None))
        if fl is None or fr is None:
            print(f"{c:>2}  {'+' if sgn > 0 else '-'}    {amp:>8.0f}   (profile not Gaussian enough)")
            continue
        cen = (fl[0] + fr[0]) / 2; sig = (fl[1] + fr[1]) / 2
        cent[c] = cen
        chars = " ▁▂▃▄▅▆▇█"
        pr = np.clip(sgn * prof, 0, None); bar = "".join(chars[int(v / max(pr.max(), 1e-9) * 8)] for v in pr)
        print(f"{c:>2}  {'+' if sgn > 0 else '-'}    {amp:>8.0f}     {fl[0]:.3f}       {fr[0]:.3f}     {cen:.3f}   {sig:.3f}   {bar}")
    order = sorted(cent, key=cent.get)
    print("\nLeft -> right:", "  ".join(f"ch{c}({cent[c]:.3f})" for c in order))
    if len(order) > 1:
        print("Neighbour spacing:", "  ".join(
            f"ch{a}->ch{b}: {cent[b]-cent[a]:.3f}" + (f" ({(cent[b]-cent[a])*args.screen_cm:.1f} cm)" if args.screen_cm else "")
            for a, b in zip(order, order[1:])))
    Path(args.out).write_text(json.dumps(dict(xs=xs, LR=LR.tolist(), RL=RL.tolist(), centres={str(k): v for k, v in cent.items()}, best=[xc, y])))
    print(f"\nSaved {args.out}")


if __name__ == "__main__":
    asyncio.run(main())
