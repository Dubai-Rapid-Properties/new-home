"""DRP watermark geometry: the logo template (D | R | P and the star) and finding it in a photo."""
import os
import cairosvg, cv2, numpy as np

SVG = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'brand', 'drp-white.svg')
W0 = 2157  # template render width (2x the SVG's)

def template():
    png = cairosvg.svg2png(url=SVG, output_width=W0)
    rgba = cv2.imdecode(np.frombuffer(png, np.uint8), cv2.IMREAD_UNCHANGED)
    rgba = rgba[: int(0.75 * rgba.shape[0])]  # drop the "Dubai Rapid Properties" line
    ys, xs = np.where(rgba[..., 3] > 0)
    rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    alpha = rgba[..., 3].astype(np.float32) / 255
    color = rgba[..., :3].astype(np.float32)
    return alpha, color

ALPHA, COLOR = template()

ALPHA, COLOR = template()
STAR = (((COLOR[..., 2] > COLOR[..., 1] + 60) & (ALPHA > 0.02)).astype(np.float32) * ALPHA).astype(np.float32)
LETTERS = (ALPHA * (STAR == 0)).astype(np.float32)


def place(x, y, tw, shape):
    """The template's alpha and colour warped onto a photo region, at sub-pixel position and scale."""
    k = tw / ALPHA.shape[1]
    soft = max(0.5 / k * 0.8, 0.01)
    a = cv2.GaussianBlur(ALPHA, (0, 0), soft); c = COLOR
    M = np.float32([[k, 0, x], [0, k, y]])
    h, w = shape
    aw = cv2.warpAffine(a, M, (w, h), flags=cv2.INTER_LINEAR)
    cw = cv2.warpAffine(c, M, (w, h), flags=cv2.INTER_LINEAR, borderValue=(255, 255, 255))
    return cv2.GaussianBlur(aw, (0, 0), 0.6), cw


def refine2(img, x, y, tw, dark):
    """refine() for either logo colour, allowing the logo to run off the frame."""
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    if dark: g = 255 - g
    tophat = g - cv2.GaussianBlur(g, (0, 0), 8)
    H, W = g.shape
    best = (-1, x, y, tw)
    for dw in np.linspace(-0.03, 0.03, 13):
        w2 = tw * (1 + dw); h2 = LETTERS.shape[0] * w2 / LETTERS.shape[1]
        t = cv2.resize(LETTERS, (int(round(w2)), int(round(h2))), interpolation=cv2.INTER_AREA)
        t = t - cv2.GaussianBlur(t, (0, 0), 8)
        pad = 12 + int(w2 / 3)
        P = cv2.copyMakeBorder(tophat, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=0)
        xs, ys = int(x + pad - 12), int(y + pad - 12)
        roi = P[max(0, ys):ys + t.shape[0] + 24, max(0, xs):xs + t.shape[1] + 24]
        if roi.shape[0] < t.shape[0] or roi.shape[1] < t.shape[1]: continue
        r = cv2.matchTemplate(roi, t, cv2.TM_CCOEFF_NORMED)
        _, mx, _, loc = cv2.minMaxLoc(r)
        if mx > best[0]: best = (mx, max(0, xs) + loc[0] - pad, max(0, ys) + loc[1] - pad, w2)
    return best


def detect_at(img, frac, dark):
    """Search the whole photo for the logo at a known size (a fraction of the photo width) and colour."""
    h, w = img.shape[:2]
    k = 900 / w
    small = cv2.resize(img, (900, int(h * k)), interpolation=cv2.INTER_AREA)
    g = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY).astype(np.float32)
    if dark: g = 255 - g
    bright = g - cv2.GaussianBlur(g, (0, 0), 6)
    f = small.astype(np.float32); orange = f[..., 2] - f[..., 0]; orange = orange - cv2.GaussianBlur(orange, (0, 0), 6)
    best = (-1, 0, 0, 0)
    for fr in frac * np.linspace(0.92, 1.08, 9):
        tw = int(900 * fr); th = int(ALPHA.shape[0] * tw / ALPHA.shape[1])
        if th >= small.shape[0]: continue
        px, py = tw // 3, th // 3
        B = cv2.copyMakeBorder(bright, py, py, px, px, cv2.BORDER_CONSTANT, value=0)
        O = cv2.copyMakeBorder(orange, py, py, px, px, cv2.BORDER_CONSTANT, value=0)
        tl = cv2.resize(LETTERS, (tw, th), interpolation=cv2.INTER_AREA); tl = tl - cv2.GaussianBlur(tl, (0, 0), 6)
        ts = cv2.resize(STAR, (tw, th), interpolation=cv2.INTER_AREA); ts = ts - cv2.GaussianBlur(ts, (0, 0), 6)
        r = 0.8 * cv2.matchTemplate(B, tl, cv2.TM_CCOEFF_NORMED) + 0.2 * np.maximum(cv2.matchTemplate(O, ts, cv2.TM_CCOEFF_NORMED), 0)
        _, mx, _, loc = cv2.minMaxLoc(r)
        if mx > best[0]: best = (mx, (loc[0] - px) / k, (loc[1] - py) / k, tw / k)
    return best
