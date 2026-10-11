"""One watermark pose per listing and photo shape: the match maps of all its photos are summed,
so faint watermarks add up and photo texture cancels out."""
import cv2, numpy as np
from watermark import LETTERS, STAR

SW = 640  # search width


def feats(f):
    img = cv2.imread(f)
    h, w = img.shape[:2]
    small = cv2.resize(img, (SW, int(round(h * SW / w))), interpolation=cv2.INTER_AREA)
    g = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY).astype(np.float32)
    o = small[..., 2].astype(np.float32) - small[..., 0]
    hp = lambda a: (a - cv2.GaussianBlur(a, (0, 0), 5))
    return hp(g), hp(255 - g), hp(o)

def group_pose(files):
    F = [feats(f) for f in files]
    H = min(fe[0].shape[0] for fe in F)
    F = [tuple(a[:H] for a in fe) for fe in F]
    best = (-1,)
    for dark in (0, 1):
        for frac in np.arange(0.15, 1.2, 0.015):
            tw = int(SW * frac); th = int(LETTERS.shape[0] * tw / LETTERS.shape[1])
            if th >= H * 0.9: break
            px, py = tw // 3, th // 3
            tl = cv2.resize(LETTERS, (tw, th), interpolation=cv2.INTER_AREA); tl = tl - cv2.GaussianBlur(tl, (0, 0), 5)
            ts = cv2.resize(STAR, (tw, th), interpolation=cv2.INTER_AREA); ts = ts - cv2.GaussianBlur(ts, (0, 0), 5)
            acc = None
            for fe in F:
                B = cv2.copyMakeBorder(fe[dark], py, py, px, px, cv2.BORDER_CONSTANT, value=0)
                O = cv2.copyMakeBorder(fe[2], py, py, px, px, cv2.BORDER_CONSTANT, value=0)
                r = cv2.matchTemplate(B, tl, cv2.TM_CCOEFF_NORMED)
                r2 = cv2.matchTemplate(O, ts, cv2.TM_CCOEFF_NORMED)
                r = 0.8 * r + 0.2 * np.maximum(r2, 0)
                acc = r if acc is None else acc + r
            acc /= len(F)
            _, mx, _, loc = cv2.minMaxLoc(acc)
            if mx > best[0]: best = (mx, (loc[0] - px) / SW, (loc[1] - py) / SW, tw / SW, dark)
    return best  # score, x, y, width as fractions of the photo width, dark
