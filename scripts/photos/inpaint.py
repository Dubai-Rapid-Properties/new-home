"""Fill the watermark's strokes (and its star, wherever it sits) with LaMa inpainting."""
import cv2, numpy as np, torch
from models import model_path
from watermark import place, ALPHA, STAR

MODEL = torch.jit.load(model_path('big-lama.pt'), map_location='cpu').eval()


def lama(img, mask):
    h, w = img.shape[:2]
    ph, pw = (8 - h % 8) % 8, (8 - w % 8) % 8
    im = cv2.copyMakeBorder(img, 0, ph, 0, pw, cv2.BORDER_REFLECT)
    mk = cv2.copyMakeBorder(mask, 0, ph, 0, pw, cv2.BORDER_REFLECT)
    t = torch.from_numpy(cv2.cvtColor(im, cv2.COLOR_BGR2RGB)).permute(2, 0, 1)[None].float() / 255
    m = torch.from_numpy((mk > 127).astype(np.float32))[None, None]
    with torch.inference_mode():
        out = MODEL(t, m)[0].permute(1, 2, 0).numpy()
    out = cv2.cvtColor(np.clip(out * 255, 0, 255).astype(np.uint8), cv2.COLOR_RGB2BGR)[:h, :w]
    # keep the original outside the mask
    keep = (mask > 127)[..., None]
    return np.where(keep, out, img)

def place_star(x, y, tw, shape):
    k = tw / ALPHA.shape[1]
    M = np.float32([[k, 0, x], [0, k, y]])
    return cv2.warpAffine(STAR, M, (shape[1], shape[0]), flags=cv2.INTER_LINEAR), None

def clean(img, x, y, tw):
    H, W = img.shape[:2]
    th = ALPHA.shape[0] * tw / ALPHA.shape[1]
    m = max(48, int(tw * 0.15))
    x0, y0 = int(max(0, x - m)), int(max(0, y - m))
    x1, y1 = int(min(W, x + tw + m)), int(min(H, y + th + m))
    roi = img[y0:y1, x0:x1]
    a, _ = place(x - x0, y - y0, tw, roi.shape[:2])
    d = max(3, int(round(tw / 110)))  # a few pixels around each stroke, more on big logos
    mask = cv2.dilate((a > 0.02).astype(np.uint8) * 255, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * d + 1, 2 * d + 1)))
    # the star sits a little off the template in some exports: cover it generously
    st, _ = place_star(x - x0, y - y0, tw, roi.shape[:2])
    mask |= cv2.dilate((st > 0.02).astype(np.uint8) * 255, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (6 * d + 1, 6 * d + 1)))
    # the star moves between exports: find it near the logo and mask it too
    star = find_star(roi, x - x0, y - y0, tw)
    if star is not None:
        mask |= cv2.dilate(star, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (4 * d + 1, 4 * d + 1)))
    out = img.copy(); out[y0:y1, x0:x1] = lama(roi, mask)
    return out

_ys, _xs = np.where(STAR > 0.02)
STAR_T = STAR[_ys.min():_ys.max() + 1, _xs.min():_xs.max() + 1]

def find_star(roi, x, y, tw):
    """Mask of the orange star at the logo's scale, wherever it sits around the logo, or None."""
    k = tw / ALPHA.shape[1]
    sw, sh = max(5, int(round(STAR_T.shape[1] * k))), max(5, int(round(STAR_T.shape[0] * k)))
    f = roi.astype(np.float32)
    orange = f[..., 2] - f[..., 0]
    orange = orange - cv2.GaussianBlur(orange, (0, 0), max(3, sw))
    best = None
    for s in (0.85, 1.0, 1.15):
        w2, h2 = max(5, int(sw * s)), max(5, int(sh * s))
        if h2 >= orange.shape[0] or w2 >= orange.shape[1]: continue
        t = cv2.resize(STAR_T, (w2, h2), interpolation=cv2.INTER_AREA)
        r = cv2.matchTemplate(orange, t - t.mean(), cv2.TM_CCOEFF_NORMED)
        _, mx, _, loc = cv2.minMaxLoc(r)
        if best is None or mx > best[0]: best = (mx, loc, t)
    if best is None or best[0] < 0.45: return None
    mx, (sx, sy), t = best
    m = np.zeros(roi.shape[:2], np.uint8)
    m[sy:sy + t.shape[0], sx:sx + t.shape[1]] = (t > 0.05).astype(np.uint8) * 255
    return m
