#!/usr/bin/env python3
"""
Optimiza capturas para la galería de L2 Intratables.

Uso (desde la raíz del sitio):
    python3 herramientas/optimizar_fotos.py nombre-del-album foto1.png foto2.png ...

Crea en assets/albums/nombre-del-album/ una versión .webp liviana de cada foto
y su miniatura, y imprime el bloque JSON de "photos" para pegar en
assets/albums/albums.json (completá el "title" de cada foto).
Requiere:  pip install pillow
"""
import json, os, re, sys, unicodedata
from PIL import Image

def slug(text):
    t = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-') or 'foto'

def optimize(album, path, index, title=''):
    out_dir = os.path.join('assets', 'albums', album)
    os.makedirs(out_dir, exist_ok=True)
    base = f'{index:02d}-{slug(title or os.path.splitext(os.path.basename(path))[0])}'
    im = Image.open(path).convert('RGB')
    full = im.copy(); full.thumbnail((1920, 1920))
    full.save(os.path.join(out_dir, base + '.webp'), quality=85, method=6)
    thumb = im.copy(); thumb.thumbnail((720, 720))
    thumb.save(os.path.join(out_dir, base + '-thumb.webp'), quality=78, method=6)
    rel = f'assets/albums/{album}/{base}'
    return {'src': rel + '.webp', 'thumb': rel + '-thumb.webp', 'title': title}

if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    album, files = sys.argv[1], sys.argv[2:]
    photos = [optimize(album, f, i + 1) for i, f in enumerate(files)]
    print(json.dumps(photos, ensure_ascii=False, indent=2))
