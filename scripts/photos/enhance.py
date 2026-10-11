"""Real-ESRGAN general x4v3 (SRVGGNetCompact): sharpen small photos and clean their JPEG artefacts."""
import torch, torch.nn as nn, torch.nn.functional as F, cv2, numpy as np
from models import model_path


class SRVGGNetCompact(nn.Module):
    def __init__(self, num_in_ch=3, num_out_ch=3, num_feat=64, num_conv=32, upscale=4):
        super().__init__()
        self.upscale = upscale
        self.body = nn.ModuleList([nn.Conv2d(num_in_ch, num_feat, 3, 1, 1), nn.PReLU(num_parameters=num_feat)])
        for _ in range(num_conv):
            self.body.append(nn.Conv2d(num_feat, num_feat, 3, 1, 1)); self.body.append(nn.PReLU(num_parameters=num_feat))
        self.body.append(nn.Conv2d(num_feat, num_out_ch * upscale * upscale, 3, 1, 1))
        self.upsampler = nn.PixelShuffle(upscale)
    def forward(self, x):
        out = x
        for m in self.body: out = m(out)
        out = self.upsampler(out)
        return out + F.interpolate(x, scale_factor=self.upscale, mode='nearest')

NET = SRVGGNetCompact()
sd = torch.load(model_path('realesr-general-x4v3.pth'), map_location='cpu', weights_only=True)
NET.load_state_dict(sd.get('params', sd)); NET.eval()

def upscale(img, tile=256, pad=10):
    """img BGR uint8 -> 4x BGR uint8, in tiles to bound memory."""
    h, w = img.shape[:2]
    x = torch.from_numpy(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)).permute(2, 0, 1)[None].float() / 255
    out = torch.zeros(1, 3, h * 4, w * 4)
    with torch.inference_mode():
        for y0 in range(0, h, tile):
            for x0 in range(0, w, tile):
                ya, xa = max(0, y0 - pad), max(0, x0 - pad)
                yb, xb = min(h, y0 + tile + pad), min(w, x0 + tile + pad)
                o = NET(x[..., ya:yb, xa:xb])
                oy, ox = (y0 - ya) * 4, (x0 - xa) * 4
                th, tw = (min(h, y0 + tile) - y0) * 4, (min(w, x0 + tile) - x0) * 4
                out[..., y0 * 4:y0 * 4 + th, x0 * 4:x0 * 4 + tw] = o[..., oy:oy + th, ox:ox + tw]
    o = (out[0].clamp(0, 1).permute(1, 2, 0).numpy() * 255).round().astype(np.uint8)
    return cv2.cvtColor(o, cv2.COLOR_RGB2BGR)

def enhance(img, target=2400):
    """Upscale small photos so the long side reaches about `target` px; larger photos only get downscaled."""
    long = max(img.shape[:2])
    if long >= target:
        k = target / long
        return cv2.resize(img, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
    up = upscale(img)
    k = min(target, long * 4) / max(up.shape[:2])
    return cv2.resize(up, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
