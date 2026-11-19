/* OPTICS LAB – real-time ray tracing. Cartesian sign convention, origin at P / O.
   Mirror: 1/v + 1/u = 1/f, m = -v/u.  Lens: 1/v - 1/u = 1/f, m = v/u.
   Concave mirror f<0, convex mirror f>0, convex lens f>0, concave lens f<0. */
const $ = s => document.querySelector(s), cv = $('#cv'), g = cv.getContext('2d');

const TERMS = [
 ['Reflection', 'Light bounces back from a smooth surface. Angle of incidence = angle of reflection. Example: your face in a mirror.'],
 ['Refraction', 'Light bends when it passes from one medium to another, such as air to glass. Example: a straw looks bent in water.'],
 ['Spherical mirror', 'A mirror that is part of a hollow sphere. Concave curves inward, convex bulges outward.'],
 ['Spherical lens', 'A piece of glass with spherical surfaces. Convex lenses converge light, concave lenses diverge it.'],
 ['Pole and principal axis', 'The pole (P) is the centre of the mirror. The principal axis is the line through P and the centre of curvature.'],
 ['Centre of curvature (C)', 'The centre of the sphere the mirror was cut from.'],
 ['Radius of curvature (R)', 'The radius of that sphere. For a mirror, R = 2f.'],
 ['Principal focus (F)', 'The point where rays parallel to the axis meet (or seem to come from) after reflection or refraction.'],
 ['Focal length (f)', 'The distance from the pole or optical centre to the principal focus.'],
 ['Optical centre (O)', 'The centre of a lens. A ray through O goes straight without bending.'],
 ['Aperture', 'The width of the mirror or lens that is open to light. A large aperture gives brighter but less sharp images.']
];
$('#terms').innerHTML = TERMS.map(([t, x]) => `<div class="card"><h3>${t}</h3><p>${x}</p></div>`).join('');

const WHY = {
 cm: 'A concave mirror converges parallel rays at F. Beyond F the image is real and inverted; between F and P it is virtual, erect and magnified (a shaving mirror).',
 vm: 'A convex mirror always diverges light. The reflected rays never meet, but their backward extensions (dashed) meet behind the mirror, so the image is always virtual, erect and diminished and lies between P and F.',
 cl: 'A convex lens converges rays. Beyond F₁ the image is real and inverted; between F₁ and O it is virtual, erect and magnified (a magnifying glass).',
 vl: 'A concave lens always diverges light. The refracted rays never meet, but their backward extensions (dashed) meet on the object side, so the image is always virtual, erect and diminished and lies between O and F.'
};
const S = {type: 'cm', d: 40, F: 15, h: 5, inf: false, rays: true, play: false};

function info() {
  const {type, d, F, inf} = S, mir = type[1] == 'm', f = (type == 'cm' || type == 'vl') ? -F : F;
  let v, m;
  if (inf) { v = f; m = 0; }
  else {
    const k = 1 / f + (mir ? 1 / d : -1 / d);
    v = Math.abs(k) < 1e-9 ? Infinity : 1 / k;
    m = isFinite(v) ? (mir ? v / d : -v / d) : Infinity;
  }
  return {mir, f, v, m, real: isFinite(v) && (mir ? v < 0 : v > 0)};
}

function draw() {
  const W = cv.width, H = cv.height, x0 = W * .6, y0 = H / 2, s = (x0 - 25) / 90;
  const st = getComputedStyle(document.body), tx = st.getPropertyValue('--tx'), mu = st.getPropertyValue('--mut');
  const X = x => x0 + x * s, Y = y => y0 - y * s, xl = -x0 / s, xr = (W - x0) / s;
  const {d, h, inf, type} = S, {mir, f, v, m, real} = info(), fin = isFinite(v), af = Math.abs(f);
  g.clearRect(0, 0, W, H); g.font = '13px sans-serif'; g.lineCap = 'round';
  const L = (a, b, c, e, col, dash, w) => {
    g.beginPath(); g.setLineDash(dash ? [6, 5] : []); g.strokeStyle = col; g.lineWidth = w || 1.8;
    g.moveTo(X(a), Y(b)); g.lineTo(X(c), Y(e)); g.stroke(); g.setLineDash([]);
  };
  const ray = (px, py, dx, dy, xe, dash, col) => L(px, py, xe, py + dy * (xe - px) / dx, col, dash);
  // outgoing ray from the surface point (0,py): solid to the image (real) or the edge (diverging), dashed backwards if virtual
  const out = (py, dx, dy, col) => {
    ray(0, py, dx, dy, fin && real ? v : (dx < 0 ? xl : xr), false, col);
    if (fin && !real) ray(0, py, dx, dy, v, true, col);
  };
  const arrow = (x, y, col, dash) => {
    L(x, 0, x, y, col, dash, 3); const q = y > 0 ? 1 : -1;
    g.beginPath(); g.fillStyle = col; g.moveTo(X(x), Y(y)); g.lineTo(X(x) - 5, Y(y) + 9 * q); g.lineTo(X(x) + 5, Y(y) + 9 * q); g.fill();
  };
  L(xl, 0, xr, 0, mu, true, 1);
  // mirror or lens
  const lh = H * .42; g.strokeStyle = '#22d3ee'; g.lineWidth = 3; g.setLineDash([]);
  if (mir) {
    const r = 2 * F * s, th = Math.asin(Math.min(.97, lh / r)); g.beginPath();
    f < 0 ? g.arc(X(2 * f), y0, r, -th, th) : g.arc(X(2 * f), y0, r, Math.PI - th, Math.PI + th); g.stroke();
  } else {
    const b = f > 0 ? 14 : -14, xp = X(0), w = f > 0 ? 0 : 9;
    g.beginPath(); g.moveTo(xp + w, y0 - lh); g.quadraticCurveTo(xp + 2 * b, y0, xp + w, y0 + lh);
    g.lineTo(xp - w, y0 + lh); g.quadraticCurveTo(xp - 2 * b, y0, xp - w, y0 - lh); g.closePath();
    g.fillStyle = 'rgba(34,211,238,.18)'; g.fill(); g.stroke();
  }
  // markers
  g.fillStyle = tx; g.textAlign = 'center';
  const marks = mir ? [['P', 0], ['F', f], ['C', 2 * f]] : [['O', 0], ['F₁', -af], ['F₂', af], ['2F₁', -2 * af], ['2F₂', 2 * af]];
  marks.forEach(([t, x]) => { g.beginPath(); g.arc(X(x), y0, 3, 0, 7); g.fill(); g.fillText(t, X(x), y0 + 18); });
  // rays
  const C = ['#fbbf24', '#34d399', '#f472b6'], par = y => mir ? [-af, y * Math.sign(f)] : [af, -y * Math.sign(f)];
  if (inf) {
    if (S.rays) [h, h * .45, -h * .45, -h].forEach(y => { L(xl, y, 0, y, C[0]); const [dx, dy] = par(y); out(y, dx, dy, C[0]); });
    g.fillStyle = mu; g.textAlign = 'left'; g.fillText('Object at infinity: parallel rays', 12, 22);
    if (fin) { g.fillStyle = '#a78bfa'; g.beginPath(); g.arc(X(v), Y(0), 5, 0, 7); g.fill(); }
  } else {
    if (S.rays) {
      L(-d, h, 0, h, C[0]); let [dx, dy] = par(h); out(h, dx, dy, C[0]);                       // ray 1: parallel to axis
      L(-d, h, 0, 0, C[1]); out(0, mir ? -d : d, -h, C[1]);                                    // ray 2: to P / through O
      const den = mir ? d + f : d - f;                                                         // ray 3: through (or towards) a focus
      if (Math.abs(den) > 1e-9) {
        const y3 = mir ? h * f / den : -h * f / den; L(-d, h, 0, y3, C[2]); out(y3, mir ? -1 : 1, 0, C[2]);
        if (type == 'vm') L(0, y3, f, 0, C[2], true); if (type == 'vl') L(0, y3, -f, 0, C[2], true);
      }
    }
    arrow(-d, h, '#22d3ee', false);
    if (fin) arrow(v, m * h, '#a78bfa', !real);
  }
  g.fillStyle = tx; g.textAlign = 'left'; g.fillText('Drag to move the object', 12, H - 12);
}

function ui() {
  const {mir, f, v, m, real} = info(), {d, h, inf} = S, fin = isFinite(v), a = Math.abs(m);
  const f1 = x => isFinite(x) ? x.toFixed(1) : '∞';
  $('#od').textContent = inf ? '∞' : d.toFixed(1) + ' cm'; $('#of').textContent = S.F.toFixed(1) + ' cm'; $('#oh').textContent = h.toFixed(1) + ' cm';
  const size = inf ? 'Point-sized' : !fin ? 'Highly magnified' : a > 1.005 ? 'Magnified' : a < .995 ? 'Diminished' : 'Same size';
  const R = [['Object distance u (cm)', inf ? '−∞' : f1(-d)], ['Image distance v (cm)', f1(v)], ['Focal length f (cm)', f1(f)],
    ['Magnification m', inf ? '→ 0' : fin ? m.toFixed(2) : '∞'], ['Image height h′ (cm)', inf ? '≈ 0' : fin ? (m * h).toFixed(2) : '∞'],
    ['Nature', fin ? (real ? 'Real' : 'Virtual') : 'At infinity'], ['Orientation', inf ? 'Inverted (real) / erect (virtual)' : fin ? (m < 0 ? 'Inverted' : 'Erect') : '—'], ['Size', size]];
  $('#read').innerHTML = R.map(([k, x]) => `<div class="card"><b>${x}</b><span>${k}</span></div>`).join('');
  $('#why').textContent = WHY[S.type];
}
function sync() { $('#d').value = S.d; $('#F').value = S.F; $('#h').value = S.h; draw(); ui(); }

function presets() {
  const mir = S.type[1] == 'm', two = S.type[0] == 'v';
  const L = two ? [['At infinity', null], ['At a finite distance', 2]] :
    (mir ? ['At infinity', 'Beyond C', 'At C', 'Between C and F', 'At F', 'Between F and P'] :
      ['At infinity', 'Beyond 2F₁', 'At 2F₁', 'Between F₁ and 2F₁', 'At F₁', 'Between F₁ and O']).map((t, i) => [t, [null, 3, 2, 1.5, 1, .5][i]]);
  $('#presets').innerHTML = L.map(([t, k], i) => `<button data-k="${k}">${t}</button>`).join('');
}
$('#presets').onclick = e => {
  const k = e.target.dataset.k; if (k === undefined) return;
  S.play = false; S.inf = k == 'null'; if (!S.inf) S.d = Math.min(90, +k * S.F); sync();
};
$('#tabs').onclick = e => {
  if (!e.target.dataset.t) return;
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b == e.target));
  S.type = e.target.dataset.t; S.inf = false; S.d = 40; S.play = false; presets(); sync();
};
['d', 'F', 'h'].forEach(k => $('#' + k).oninput = e => { S[k] = +e.target.value; if (k == 'd') S.inf = false; sync(); });
$('#rays').onchange = e => { S.rays = e.target.checked; draw(); };
$('#play').onclick = () => S.play = true; $('#pause').onclick = () => S.play = false;
$('#reset').onclick = () => { Object.assign(S, {d: 40, F: 15, h: 5, inf: false, play: false}); sync(); };
$('#theme').onclick = () => { const r = document.documentElement; r.dataset.theme = r.dataset.theme == 'dark' ? 'light' : 'dark'; draw(); };

let drag = 0;
const pt = e => {
  const r = cv.getBoundingClientRect(), px = (e.clientX - r.left) * cv.width / r.width, x0 = cv.width * .6, s = (x0 - 25) / 90;
  S.d = Math.min(90, Math.max(1, (x0 - px) / s)); S.inf = false; S.play = false; sync();
};
cv.onpointerdown = e => { drag = 1; cv.setPointerCapture(e.pointerId); pt(e); };
cv.onpointermove = e => drag && pt(e); cv.onpointerup = () => drag = 0;
(function loop() { if (S.play) { S.d -= .25; if (S.d < 2) S.d = 90; S.inf = false; sync(); } requestAnimationFrame(loop); })();
const fit = () => { cv.width = cv.clientWidth; draw(); };
addEventListener('resize', fit);

// formula calculator
$('#calc').onclick = () => {
  const a = $('#ct').value == 'm' ? 1 : -1, n = id => $(id).value === '' ? null : +$(id).value;
  let f = n('#cf'), u = n('#cu'), v = n('#cvv'), o;
  if ([f, u, v].filter(x => x === null).length != 1) o = 'Fill exactly two of f, u and v, and leave one empty.';
  else {
    if (f === null) f = 1 / (1 / v + a / u); else if (v === null) v = 1 / (1 / f - a / u); else u = a / (1 / f - 1 / v);
    const m = a == 1 ? -v / u : v / u;
    o = `f = ${f.toFixed(2)} cm, u = ${u.toFixed(2)} cm, v = ${v.toFixed(2)} cm, m = ${m.toFixed(2)}`;
  }
  $('#cout').textContent = o;
};
presets(); fit(); ui();
