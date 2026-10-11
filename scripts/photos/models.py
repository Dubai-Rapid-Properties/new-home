"""Model weights, downloaded once into scripts/photos/.models (git-ignored)."""
import os, urllib.request

DIR = os.path.join(os.path.dirname(__file__), '.models')
URLS = {
    'big-lama.pt': 'https://github.com/enesmsahin/simple-lama-inpainting/releases/download/v0.1.0/big-lama.pt',
    'realesr-general-x4v3.pth': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth',
}

def model_path(name):
    path = os.path.join(DIR, name)
    if not os.path.exists(path):
        os.makedirs(DIR, exist_ok=True)
        print(f'downloading {name}…')
        urllib.request.urlretrieve(URLS[name], path)
    return path
