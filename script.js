const simCanvas = document.getElementById('simCanvas');
const ctx = simCanvas.getContext('2d');
const fbdCanvas = document.getElementById('fbdCanvas');
const fbdCtx = fbdCanvas.getContext('2d');

const metricTime = document.getElementById('metric-time');
const metricRange = document.getElementById('metric-range');
const metricAltitude = document.getElementById('metric-altitude');
const metricMaxRange = document.getElementById('metric-max-range');
const launchBtn = document.getElementById('launchBtn');

const g = 9.81;
let animationFrameId = null;

let state = {
    t: 0,
    x0: 60,
    y0: 430,
    scale: 4,
    v0: 0,
    angleRad: 0,
    vx: 0,
    vy0: 0,
    totalTime: 0,
    running: false,
    trail: []
};

function resizeCanvases() {
    simCanvas.width = simCanvas.clientWidth;
    simCanvas.height = simCanvas.clientHeight;
    fbdCanvas.width = fbdCanvas.clientWidth;
    fbdCanvas.height = fbdCanvas.clientHeight;
    state.y0 = simCanvas.height - 50; 
}
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

function initSimulation() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    const v0Input = parseFloat(document.getElementById('velocity').value);
    const thetaInput = parseFloat(document.getElementById('theta').value);

    state.v0 = v0Input;
    state.angleRad = (thetaInput * Math.PI) / 180;
    
    state.vx = state.v0 * Math.cos(state.angleRad);
    state.vy0 = state.v0 * Math.sin(state.angleRad);

    state.totalTime = (2 * state.vy0) / g;
    const maxRangeTheoretical = (Math.pow(state.v0, 2) * Math.sin(2 * state.angleRad)) / g;
    metricMaxRange.innerText = `${maxRangeTheoretical.toFixed(2)} m`;

    state.t = 0;
    state.trail = [];
    state.running = true;

    const availableWidth = simCanvas.width - 120;
    state.scale = availableWidth / Math.max(maxRangeTheoretical, 50);

    animate();
}

function animate() {
    if (!state.running) return;

    ctx.clearRect(0, 0, simCanvas.width, simCanvas.height);
    
    ctx.beginPath();
    ctx.moveTo(0, state.y0);
    ctx.lineTo(simCanvas.width, state.y0);
    ctx.strokeStyle = '#7928ca';
    ctx.lineWidth = 3;
    ctx.stroke();

    state.t += 0.02;
    if (state.t > state.totalTime) state.t = state.totalTime;

    const currentX_m = state.vx * state.t;
    const currentY_m = (state.vy0 * state.t) - (0.5 * g * Math.pow(state.t, 2));
    const currentVy_m = state.vy0 - (g * state.t);

    const posX_px = state.x0 + (currentX_m * state.scale);
    const posY_px = state.y0 - (currentY_m * state.scale);

    state.trail.push({ x: posX_px, y: posY_px });

    ctx.beginPath();
    ctx.strokeStyle = '#00ffcc';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00ffcc';
    ctx.lineWidth = 3;
    state.trail.forEach((point, idx) => {
        if (idx === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(posX_px, posY_px, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#ff007f';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ff007f';
    ctx.fill();
    ctx.shadowBlur = 0;

    metricTime.innerText = `${state.t.toFixed(2)} s`;
    metricRange.innerText = `${currentX_m.toFixed(2)} m`;
    metricAltitude.innerText = `${Math.max(0, currentY_m).toFixed(2)} m`;

    drawFBD(state.vx, currentVy_m);

    if (state.t < state.totalTime) {
        animationFrameId = requestAnimationFrame(animate);
    } else {
        state.running = false;
    }
}

function drawFBD(vx, vy) {
    fbdCtx.clearRect(0, 0, fbdCanvas.width, fbdCanvas.height);

    const centerX = fbdCanvas.width / 2;
    const centerY = fbdCanvas.height / 2 + 20;

    fbdCtx.beginPath();
    fbdCtx.arc(centerX, centerY, 10, 0, Math.PI * 2);
    fbdCtx.fillStyle = '#ffff00';
    fbdCtx.shadowBlur = 10;
    fbdCtx.shadowColor = '#ffff00';
    fbdCtx.fill();
    fbdCtx.shadowBlur = 0;

    drawVector(fbdCtx, centerX, centerY, centerX, centerY + 80, '#ff007f', 'F_g (mg)');

    const vectorScale = 65 / state.v0;
    const targetVx = centerX + (vx * vectorScale);
    const targetVy = centerY - (vy * vectorScale);

    drawVector(fbdCtx, centerX, centerY, targetVx, targetVy, '#00ffcc', 'V');
    drawVector(fbdCtx, centerX, centerY, targetVx, centerY, '#007fff', 'v·cos(θ)');
    drawVector(fbdCtx, centerX, centerY, centerX, targetVy, '#ffff00', 'v·sin(θ)');

    fbdCtx.setLineDash([3, 3]);
    fbdCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    fbdCtx.lineWidth = 1;
    
    fbdCtx.beginPath();
    fbdCtx.moveTo(targetVx, targetVy);
    fbdCtx.lineTo(targetVx, centerY);
    fbdCtx.stroke();

    fbdCtx.beginPath();
    fbdCtx.moveTo(targetVx, targetVy);
    fbdCtx.lineTo(centerX, targetVy);
    fbdCtx.stroke();
    
    fbdCtx.setLineDash([]);
}

function drawVector(context, fromX, fromY, toX, toY, color, text) {
    const headLength = 8;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    context.beginPath();
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);
    context.strokeStyle = color;
    context.lineWidth = 2.5;
    context.stroke();

    context.beginPath();
    context.moveTo(toX, toY);
    context.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    context.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    context.fillStyle = color;
    context.fill();

    context.fillStyle = '#ffffff';
    context.font = 'bold 10px monospace';
    context.fillText(text, toX + 6 * Math.cos(angle), toY + 6 * Math.sin(angle) + 3);
}

launchBtn.addEventListener('click', initSimulation);