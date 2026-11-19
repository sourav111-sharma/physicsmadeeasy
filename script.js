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
        const y3 = mir

