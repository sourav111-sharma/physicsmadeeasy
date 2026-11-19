// --- Theme Handling ---
const themeBtn = document.getElementById('theme-toggle');
themeBtn.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    document.body.setAttribute('data-theme', currentTheme === 'light' ? 'dark' : 'light');
    drawLab(); 
    initParticles(); // Refresh background color logic
});

// --- Background Particle Animation ---
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
let particles = [];

function initParticles() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    particles = [];
    const isLight = document.body.getAttribute('data-theme') === 'light';
    const numParticles = window.innerWidth < 768 ? 40 : 80;
    
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            radius: Math.random() * 2 + 1,
            color: isLight ? `rgba(2, 132, 199, ${Math.random()*0.3})` : `rgba(0, 242, 254, ${Math.random()*0.5})`
        });
    }
}

function animateParticles() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > bgCanvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > bgCanvas.height) p.vy *= -1;
        
        bgCtx.beginPath();
        bgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        bgCtx.fillStyle = p.color;
        bgCtx.fill();
    });
    requestAnimationFrame(animateParticles);
}
window.addEventListener('resize', initParticles);
initParticles();
animateParticles();

// --- Virtual Lab Physics Engine ---
const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;
const centerX = width / 2;
const centerY = height / 2;

// UI Elements mapping
const ui = {
    uSlider: document.getElementById('u-slider'),
    fSlider: document.getElementById('f-slider'),
    hSlider: document.getElementById('h-slider'),
    device: document.getElementById('device-select'),
    mode: document.getElementById('mode-select'),
    uVal: document.getElementById('u-val'),
    fVal: document.getElementById('f-val'),
    hVal: document.getElementById('h-val'),
    vStat: document.getElementById('v-stat'),
    mStat: document.getElementById('m-stat'),
    natureStat: document.getElementById('nature-stat'),
    guideText: document.getElementById('guide-text')
};

let state = { u: -150, f: 100, h: 50, device: 'concave-mirror', isDragging: false };

// Event Listeners
['uSlider', 'fSlider', 'hSlider'].forEach(key => {
    ui[key].addEventListener('input', (e) => {
        state[key[0]] = parseInt(e.target.value);
        updateSim();
    });
});
ui.device.addEventListener('change', (e) => { state.device = e.target.value; updateSim(); });
ui.mode.addEventListener('change', (e) => {
    if (e.target.value === 'guided') {
        ui.guideText.classList.remove('hidden');
        checkGuidedGoal();
    } else {
        ui.guideText.classList.add('hidden');
    }
});

// Dragging Logic
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const clickU = (e.clientX - rect.left) * scaleX - centerX;
    if(Math.abs(clickU - state.u) < 40) state.isDragging = true;
});
canvas.addEventListener('mousemove', (e) => {
    if(state.isDragging) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        let newU = (e.clientX - rect.left) * scaleX - centerX;
        if(newU >= -10) newU = -10; 
        if(newU <= -400) newU = -400;
        state.u = newU;
        ui.uSlider.value = Math.round(state.u);
        updateSim();
    }
});
window.addEventListener('mouseup', () => state.isDragging = false);
window.addEventListener('mouseleave', () => state.isDragging = false);

// Calculation Engine
function calculateImage() {
    let v, m, nature;
    let f_val = state.f; 
    
    // Cartesian convention application
    if (state.device === 'concave-mirror' || state.device === 'concave-lens') f_val = -state.f; 

    if (state.device.includes('mirror')) {
        // 1/v = 1/f - 1/u
        v = (state.u * f_val) / (state.u - f_val);
        m = -v / state.u;
    } else {
        // 1/v = 1/f + 1/u
        v = (state.u * f_val) / (state.u + f_val);
        m = v / state.u;
    }

    if (Math.abs(state.u) === Math.abs(f_val) && state.device.includes('mirror')) {
        v = Infinity; m = Infinity; nature = "At Infinity";
    } else {
        if (state.device.includes('mirror')) {
            nature = v < 0 ? "Real, Inverted" : "Virtual, Erect";
        } else {
            nature = v > 0 ? "Real, Inverted" : "Virtual, Erect";
        }
    }

    return { v, m, nature, f_val };
}

// Drawing Primitives
function drawArrow(x, yBase, h, color, dashed=false) {
    if(h === Infinity || isNaN(h)) return;
    const clampedH = Math.max(Math.min(h, 250), -250); // Visual clamp
    ctx.beginPath();
    ctx.setLineDash(dashed ? [6, 6] : []);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 4;
    ctx.moveTo(x, yBase);
    ctx.lineTo(x, yBase - clampedH);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x, yBase - clampedH);
    ctx.lineTo(x - 6, yBase - clampedH + (clampedH > 0 ? 12 : -12));
    ctx.lineTo(x + 6, yBase - clampedH + (clampedH > 0 ? 12 : -12));
    ctx.fill();
    ctx.setLineDash([]);
}

function drawLine(x1, y1, x2, y2, color, dashed=false) {
    ctx.beginPath();
    ctx.setLineDash(dashed ? [5, 5] : []);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Render Lab
function drawLab() {
    ctx.clearRect(0, 0, width, height);
    const isLight = document.body.getAttribute('data-theme') === 'light';
    const colors = {
        axis: isLight ? '#94a3b8' : '#334155',
        device: isLight ? '#0f172a' : '#f8fafc',
        ray: isLight ? '#dc2626' : '#ef4444',
        ext: isLight ? '#64748b' : '#94a3b8',
        text: isLight ? '#000' : '#fff'
    };

    // Axis
    drawLine(0, centerY, width, centerY, colors.axis);

    let { v, m, nature, f_val } = calculateImage();

    // Device Drawing
    ctx.strokeStyle = colors.device;
    ctx.lineWidth = 4;
    ctx.beginPath();
    if (state.device === 'concave-mirror') ctx.arc(centerX + 200, centerY, 200, Math.PI - 0.4, Math.PI + 0.4);
    else if (state.device === 'convex-mirror') ctx.arc(centerX - 200, centerY, 200, -0.4, 0.4);
    else if (state.device === 'convex-lens') ctx.ellipse(centerX, centerY, 15, 100, 0, 0, 2 * Math.PI);
    else if (state.device === 'concave-lens') {
        ctx.moveTo(centerX - 12, centerY - 100); ctx.lineTo(centerX + 12, centerY - 100);
        ctx.quadraticCurveTo(centerX - 5, centerY, centerX + 12, centerY + 100);
        ctx.lineTo(centerX - 12, centerY + 100); ctx.quadraticCurveTo(centerX + 5, centerY, centerX - 12, centerY - 100);
    }
    ctx.stroke();

    // Focal & Center Points
    ctx.fillStyle = colors.text;
    ctx.font = "bold 16px Inter";
    ctx.fillText("P/O", centerX + 8, centerY + 20);
    
    [-1, 1].forEach(sign => {
        let px = centerX + sign * Math.abs(state.f);
        ctx.beginPath(); ctx.arc(px, centerY, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillText(sign === Math.sign(f_val) ? "F" : "F'", px - 5, centerY + 25);
        
        let cx = centerX + sign * 2 * Math.abs(state.f);
        ctx.beginPath(); ctx.arc(cx, centerY, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillText(sign === Math.sign(f_val) ? "C/2F" : "2F'", cx - 15, centerY + 25);
    });

    // Arrows
    let objX = centerX + state.u;
    drawArrow(objX, centerY, state.h, '#10b981'); // Object (Green)

    if (v !== Infinity) {
        let imgX = centerX + v;
        drawArrow(imgX, centerY, state.h * m, '#3b82f6', nature.includes("Virtual")); // Image (Blue)
    }

    // Simplified Ray Logic (Visual approximation matching math)
    let tipY = centerY - state.h;
    // Ray 1 (Parallel)
    drawLine(objX, tipY, centerX, tipY, colors.ray);
    // Ray 2 (Through Pole)
    drawLine(objX, tipY, centerX, centerY, colors.ray);
    
    // In a full commercial engine we map intersection perfectly to Canvas coordinates,
    // For this educational UI, drawing the lines pointing strictly to the calculated Image tip is the cleanest method.
    if(v !== Infinity && Math.abs(v) < 1000) {
        let imgTipY = centerY - (state.h * m);
        let imgX = centerX + v;
        let isVirtual = nature.includes("Virtual");
        
        if (state.device.includes('mirror')) {
            // Ray 1 reflecting
            drawLine(centerX, tipY, imgX, imgTipY, isVirtual ? colors.ext : colors.ray, isVirtual);
            if(!isVirtual) drawLine(centerX, tipY, centerX - 800, tipY + (imgTipY - tipY)/(v)*(-800), colors.ray);
            
            // Ray 2 reflecting
            drawLine(centerX, centerY, imgX, imgTipY, isVirtual ? colors.ext : colors.ray, isVirtual);
            if(!isVirtual) drawLine(centerX, centerY, centerX - 800, centerY + (imgTipY - centerY)/(v)*(-800), colors.ray);
        } else {
            // Lens Refracting
            drawLine(centerX, tipY, imgX, imgTipY, isVirtual ? colors.ext : colors.ray, isVirtual);
            if(!isVirtual) drawLine(centerX, tipY, imgX + 800, imgTipY + (imgTipY - tipY)/(v)*(800), colors.ray);
            
            drawLine(centerX, centerY, imgX, imgTipY, isVirtual ? colors.ext : colors.ray, isVirtual);
            if(!isVirtual) drawLine(centerX, centerY, imgX + 800, imgTipY + (imgTipY - centerY)/(v)*(800), colors.ray);
        }
    }
}

function checkGuidedGoal() {
    if(ui.mode.value !== 'guided') return;
    const targetU = -2 * state.f; // Place at C
    if(Math.abs(state.u - targetU) < 5) {
        ui.guideText.innerText = "⭐ Excellent! Object is at C. Notice the image is real, inverted, and same size!";
        ui.guideText.style.color = "var(--success)";
    } else {
        ui.guideText.innerText = "Challenge: Drag the object exactly to Center of Curvature (C/2F).";
        ui.guideText.style.color = "var(--secondary)";
    }
}

function updateSim() {
    ui.uVal.innerText = Math.round(state.u);
    ui.fVal.innerText = state.f;
    ui.hVal.innerText = state.h;
    
    let stats = calculateImage();
    ui.vStat.innerText = stats.v === Infinity ? "Infinity" : `${stats.v.toFixed(1)} cm`;
    ui.mStat.innerText = stats.m === Infinity ? "Infinity" : stats.m.toFixed(2);
    ui.natureStat.innerText = stats.nature;
    
    checkGuidedGoal();
    drawLab();
}
updateSim();

// --- Hero Animation (Mini Lens) ---
const hCanvas = document.getElementById('heroCanvas');
const hCtx = hCanvas.getContext('2d');
let hTime = 0;
function animateHero() {
    hCtx.clearRect(0, 0, hCanvas.width, hCanvas.height);
    const hcX = hCanvas.width/2; const hcY = hCanvas.height/2;
    
    // Lens
    hCtx.beginPath();
    hCtx.ellipse(hcX, hcY, 20, 100, 0, 0, Math.PI*2);
    hCtx.strokeStyle = '#00f2fe';
    hCtx.lineWidth = 4;
    hCtx.stroke();

    // Sine wave light ray
    hCtx.beginPath();
    let waveOffset = Math.sin(hTime) * 40;
    hCtx.moveTo(hcX - 200, hcY + waveOffset);
    hCtx.lineTo(hcX, hcY + waveOffset);
    hCtx.lineTo(hcX + 200, hcY); // Focus effect
    hCtx.strokeStyle = '#a855f7';
    hCtx.lineWidth = 3;
    hCtx.stroke();
    
    hTime += 0.05;
    requestAnimationFrame(animateHero);
}
animateHero();

// --- Advanced Quiz Module ---
const quizData = [
    { q: "Where should an object be placed in front of a convex lens to get a real image of the same size?", opts: ["At Principal Focus (F)", "At twice the focal length (2F)", "Between F and 2F", "At Infinity"], ans: 1, exp: "When placed at 2F, the image forms at 2F on the other side, real, inverted, and same size." },
    { q: "A concave mirror produces a virtual, erect, and magnified image. Where is the object located?", opts: ["Beyond C", "At C", "Between F and P", "At Focus (F)"], ans: 2, exp: "This is the only case where a concave mirror forms a virtual image (used in shaving mirrors)." },
    { q: "According to Sign Convention, what is the focal length of a Concave Lens?", opts: ["Always Positive (+)", "Always Negative (-)", "Depends on Object", "Zero"], ans: 1, exp: "A concave lens has a virtual principal focus on the left side (against incident light), so 'f' is negative." }
];
let currentQ = 0;
let score = 0;

function renderQuiz() {
    const q = quizData[currentQ];
    document.getElementById('quiz-progress').innerText = `Question ${currentQ + 1} of ${quizData.length}`;
    document.getElementById('quiz-score').innerText = `Score: ${score}`;
    document.getElementById('quiz-question').innerText = q.q;
    document.getElementById('quiz-explanation').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    
    const optsGrid = document.getElementById('quiz-options');
    optsGrid.innerHTML = "";
    q.opts.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => handleAnswer(index, btn);
        optsGrid.appendChild(btn);
    });
}

function handleAnswer(selectedIndex, btnNode) {
    const q = quizData[currentQ];
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.onclick = null); // disable clicks
    
    if (selectedIndex === q.ans) {
        btnNode.classList.add('correct');
        score++;
    } else {
        btnNode.classList.add('wrong');
        buttons[q.ans].classList.add('correct'); // Highlight actual correct
    }
    
    const exp = document.getElementById('quiz-explanation');
    exp.innerText = q.exp;
    exp.classList.remove('hidden');
    
    document.getElementById('next-btn').classList.remove('hidden');
    if (currentQ === quizData.length - 1) {
        document.getElementById('next-btn').innerText = "Finish Quiz";
    }
}

function nextQuestion() {
    if (currentQ < quizData.length - 1) {
        currentQ++;
        renderQuiz();
    } else {
        document.getElementById('quiz-app').innerHTML = `<h3>Quiz Completed!</h3><p style="font-size:1.2rem; margin-top:1rem;">Your Final Score: <span style="color:var(--primary); font-weight:bold;">${score} / ${quizData.length}</span></p><button class="btn btn-outline" style="margin-top:1rem;" onclick="location.reload()">Restart Quiz</button>`;
    }
}
renderQuiz();

// --- Formula Calculator ---
function calculateFormula() {
    const type = document.getElementById('calc-type').value;
    const fIn = document.getElementById('calc-f').value;
    const uIn = document.getElementById('calc-u').value;
    const vIn = document.getElementById('calc-v').value;
    const resBox = document.getElementById('calc-result');

    let f = parseFloat(fIn); let u = parseFloat(uIn); let v = parseFloat(vIn);
    let filled = [!isNaN(f), !isNaN(u), !isNaN(v)].filter(Boolean).length;

    if (type === 'mag') {
        if (!isNaN(u) && !isNaN(v)) {
            resBox.innerHTML = `Magnification (m) = <span>${(-v/u).toFixed(2)} (Mirror) or ${(v/u).toFixed(2)} (Lens)</span>`;
            return;
        } else {
            resBox.innerHTML = "<span style='color:var(--danger)'>Provide both u and v for Magnification.</span>";
            return;
        }
    }

    if (filled !== 2) {
        resBox.innerHTML = "<span style='color:var(--danger)'>Error: Leave exactly ONE input blank.</span>";
        return;
    }

    try {
        if (isNaN(f)) {
            let res = type === 'mirror' ? (u * v)/(u + v) : (u * v)/(u - v);
            resBox.innerHTML = `Calculated Focal Length (f) = <span>${res.toFixed(2)}</span>`;
        } else if (isNaN(v)) {
            let res = type === 'mirror' ? (u * f)/(u - f) : (u * f)/(u + f);
            resBox.innerHTML = `Calculated Image Dist (v) = <span>${res.toFixed(2)}</span>`;
        } else if (isNaN(u)) {
            let res = type === 'mirror' ? (v * f)/(v - f) : (v * f)/(f - v);
            resBox.innerHTML = `Calculated Object Dist (u) = <span>${res.toFixed(2)}</span>`;
        }
    } catch(e) {
        resBox.innerHTML = "<span style='color:var(--danger)'>Mathematical Error.</span>";
    }
}
