
# OPTICS LAB – Explore the Science of Image Formation

Interactive physics site on spherical mirrors and lenses. Plain HTML, CSS and JavaScript; no build step, no paid services.

## Run
Open `index.html` in a browser.

## Deploy on GitHub Pages
1. Push `index.html`, `style.css`, `script.js` and `README.md` to a repository.
2. Settings → Pages → Source: `main` branch, `/ (root)`.

## How the ray tracer works (`script.js`)
- Cartesian sign convention, origin at the pole (mirror) or optical centre (lens), light travelling left to right.
- Mirror: `1/v + 1/u = 1/f`, `m = -v/u`. Lens: `1/v - 1/u = 1/f`, `m = v/u`.
- Concave mirror and concave lens have `f < 0`; convex mirror and convex lens have `f > 0`.
- Each frame, `info()` computes `v` and `m` from the slider values; `draw()` traces three principal rays from the object tip. Virtual images are shown with dashed backward extensions.
- Special cases: object at infinity (parallel rays, image at F), object at F (image distance is infinite, rays come out parallel).
- Edit `TERMS`, `WHY` and `presets()` to change text and presets.

## Still to add
Experiment zone, mirror/lens comparison, real-life application cards, Predict-the-Image game, quizzes, Teacher Mode.
