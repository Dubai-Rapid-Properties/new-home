#!/usr/bin/env python3
"""
Removes DRP's watermark from listing photos and enhances them, for the
photos Property Finder serves with the logo baked in.

  python3 scripts/photos/clean_photos.py

For every Property Finder photo listed in data/imported/pf-photos.json
(written by the PF sync) that has no cleaned copy yet, it:

  1. finds the D | R | P watermark: one pose per listing and photo shape,
     summed over all its photos, then refined photo by photo;
  2. fills the logo's strokes and star with LaMa inpainting;
  3. sharpens photos under 2048px with Real-ESRGAN (general x4v3);
  4. saves public/media/listings/<ref>/<name>.webp and records it in
     data/imported/clean-photos.json, which the PF sync uses in place of
     Property Finder's URL.

Needs: pip install torch opencv-python-headless cairosvg numpy
(CPU is fine: about 10 seconds a photo). Model weights download on first run.
"""
import json, os, sys, tempfile, time, urllib.request, collections
import cv2

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from watermark import LETTERS, refine2, detect_at  # noqa: E402
from pose import group_pose  # noqa: E402
from inpaint import clean  # noqa: E402
from enhance import enhance  # noqa: E402

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PHOTOS = os.path.join(REPO, 'data', 'imported', 'pf-photos.json')
MANIFEST = os.path.join(REPO, 'data', 'imported', 'clean-photos.json')
GROUP_MIN = 0.2   # a listing's summed match below this: no watermark
PHOTO_MIN = 0.15  # a photo's refined match below this: leave it alone


def name_for(url):
    """File name from the URL; newer PF photos all end in /original.jpg, so use the folder before it."""
    parts = url.split('?')[0].rstrip('/').split('/')
    stem = os.path.splitext(parts[-1])[0]
    return parts[-2] if stem in ('original', 'watermarked', 'large', 'medium') else stem


def inside(x, y, w, W, H):
    h = LETTERS.shape[0] * w / LETTERS.shape[1]
    return x >= -0.05 * W and y >= -0.05 * H and x + w <= 1.05 * W and y + h <= 1.05 * H


def main():
    photos = json.load(open(PHOTOS))
    manifest = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {}
    todo = {ref: [u for u in urls if u not in manifest] for ref, urls in photos.items()}
    todo = {ref: urls for ref, urls in todo.items() if urls}
    print(f'{sum(map(len, todo.values()))} photos to clean in {len(todo)} listings')

    with tempfile.TemporaryDirectory() as tmp:
        for ref, urls in todo.items():
            files = {}
            for i, url in enumerate(urls):
                path = os.path.join(tmp, f'{ref}_{i}.jpg')
                urllib.request.urlretrieve(url, path)
                files[url] = path
            # one pose per photo shape in the listing
            shapes = collections.defaultdict(list)
            for url, path in files.items():
                h, w = cv2.imread(path).shape[:2]
                shapes[round(h / w, 2)].append(url)
            for group in shapes.values():
                score, gx, gy, gw, dark = group_pose([files[u] for u in group])
                for url in group:
                    t = time.time()
                    img = cv2.imread(files[url]); H, W = img.shape[:2]
                    cleaned = False
                    if score >= GROUP_MIN:
                        cands = [refine2(img, gx * W, gy * W, gw * W, dark)]
                        s, x, y, tw = detect_at(img, gw, dark)
                        cands.append(refine2(img, x, y, tw, dark))
                        cands = [c for c in cands if c[0] >= PHOTO_MIN and inside(c[1], c[2], c[3], W, H)]
                        if cands:
                            _, x, y, tw = max(cands, key=lambda c: c[0])
                            img = clean(img, x, y, tw)
                            cleaned = True
                    out = enhance(img, target=2048)
                    rel = f'/media/listings/{ref}/{name_for(url)}.webp'
                    os.makedirs(os.path.dirname(REPO + '/public' + rel), exist_ok=True)
                    cv2.imwrite(REPO + '/public' + rel, out, [cv2.IMWRITE_WEBP_QUALITY, 80])
                    manifest[url] = rel
                    with open(MANIFEST, 'w') as f:
                        json.dump(manifest, f, indent=1, sort_keys=True)
                    print(f"{ref} {name_for(url)}: {'cleaned' if cleaned else 'enhanced'}, {time.time() - t:.0f}s")
    print('done — run `npm run sync:pf` so listings use the cleaned photos')


if __name__ == '__main__':
    main()
