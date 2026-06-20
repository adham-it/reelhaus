# REELHAUS

Premium Content Marketing – Onepager (statisch: HTML, Tailwind via CDN, Vanilla JS).

## Lokal ansehen
```bash
python serve.py
# -> http://localhost:8000
```
`serve.py` ist nur für die lokale Entwicklung (mit HTTP-Range-Support für Video auf iOS).
Auf GitHub Pages wird er nicht gebraucht.

## Struktur
- `index.html` – die komplette Seite
- `assets/style.css` – Design-Tokens & Animationen
- `assets/main.js` – Interaktivität (Reel-Feed, Mute, Blueprint-Timeline …)
- `assets/videos/` – Reels (reel-1.mp4 …)
