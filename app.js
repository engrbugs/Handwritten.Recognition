const drawCanvas = document.getElementById('draw-canvas');
const networkCanvas = document.getElementById('network-canvas');
const drawCtx = drawCanvas.getContext('2d');
const netCtx = networkCanvas.getContext('2d');
const probabilityRoot = document.getElementById('probabilities');
const statePill = document.getElementById('network-state');
const confidenceLabel = document.getElementById('confidence-label');
const latencyLabel = document.getElementById('latency');

const digitPatterns = {
  0:['01110','10001','10011','10101','11001','10001','01110'],
  1:['00100','01100','00100','00100','00100','00100','01110'],
  2:['01110','10001','00001','00010','00100','01000','11111'],
  3:['11110','00001','00001','01110','00001','00001','11110'],
  4:['00010','00110','01010','10010','11111','00010','00010'],
  5:['11111','10000','10000','11110','00001','00001','11110'],
  6:['01110','10000','10000','11110','10001','10001','01110'],
  7:['11111','00001','00010','00100','01000','01000','01000'],
  8:['01110','10001','10001','01110','10001','10001','01110'],
  9:['01110','10001','10001','01111','00001','00001','01110']
};

let probabilities = Array(10).fill(.1);
let inputMode = 'digit';
let drawing = false;
let lastPoint = null;
let animationTime = 0;

function clearCanvas() {
  drawCtx.fillStyle = '#080e1e';
  drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
  drawCtx.strokeStyle = 'rgba(78,145,255,.09)';
  drawCtx.lineWidth = 1;
  for (let i = 10; i < 280; i += 10) {
    drawCtx.beginPath(); drawCtx.moveTo(i, 0); drawCtx.lineTo(i, 280); drawCtx.stroke();
    drawCtx.beginPath(); drawCtx.moveTo(0, i); drawCtx.lineTo(280, i); drawCtx.stroke();
  }
  inputMode = 'blank';
  setProbabilities(Array(10).fill(.1), 'READY');
}

function pointerPoint(event) {
  const rect = drawCanvas.getBoundingClientRect();
  return { x:(event.clientX - rect.left) * drawCanvas.width / rect.width, y:(event.clientY - rect.top) * drawCanvas.height / rect.height };
}

function drawStroke(point) {
  drawCtx.strokeStyle = '#55f0ad';
  drawCtx.shadowColor = '#28d99a';
  drawCtx.shadowBlur = 12;
  drawCtx.lineCap = 'round'; drawCtx.lineJoin = 'round'; drawCtx.lineWidth = 13;
  drawCtx.beginPath();
  if (lastPoint) { drawCtx.moveTo(lastPoint.x, lastPoint.y); drawCtx.lineTo(point.x, point.y); } else { drawCtx.moveTo(point.x, point.y); drawCtx.lineTo(point.x + .1, point.y + .1); }
  drawCtx.stroke(); drawCtx.shadowBlur = 0; lastPoint = point;
}

function loadDigit(digit) {
  clearCanvas();
  const pattern = digitPatterns[digit];
  const cell = 28;
  drawCtx.strokeStyle = '#55f0ad'; drawCtx.shadowColor = '#28d99a'; drawCtx.shadowBlur = 14;
  drawCtx.lineWidth = 13; drawCtx.lineCap = 'round'; drawCtx.lineJoin = 'round';
  pattern.forEach((row, y) => row.split('').forEach((value, x) => {
    if (value !== '1') return;
    drawCtx.beginPath(); drawCtx.moveTo(42 + x * cell, 48 + y * cell); drawCtx.lineTo(42 + x * cell + .1, 48 + y * cell + .1); drawCtx.stroke();
  }));
  drawCtx.shadowBlur = 0; inputMode = 'digit';
  const values = Array(10).fill(.006); values[digit] = .952; values[(digit + 1) % 10] = .018; values[(digit + 9) % 10] = .011;
  setProbabilities(values, 'INFERENCE'); selectDigitButton(digit);
}

function loadNonsense() {
  clearCanvas();
  drawCtx.strokeStyle = '#f378bd'; drawCtx.shadowColor = '#e73b9e'; drawCtx.shadowBlur = 18; drawCtx.lineWidth = 11; drawCtx.lineCap = 'round';
  const points = [[40,52],[96,48],[63,91],[136,118],[42,157],[100,184],[194,154],[155,224],[232,232],[184,77],[224,54],[198,114]];
  drawCtx.beginPath(); points.forEach(([x,y], index) => index ? drawCtx.lineTo(x,y) : drawCtx.moveTo(x,y)); drawCtx.stroke(); drawCtx.shadowBlur = 0;
  inputMode = 'nonsense';
  setProbabilities([.01,.02,.06,.04,.64,.08,.03,.05,.02,.05], 'OOD WARNING');
}

function selectDigitButton(digit) { document.querySelectorAll('[data-digit]').forEach(button => button.classList.toggle('selected', button.dataset.digit === String(digit))); }

function setProbabilities(values, state) {
  probabilities = values; statePill.textContent = state; statePill.style.color = state === 'OOD WARNING' ? '#f378bd' : '#45e9a3'; statePill.style.borderColor = state === 'OOD WARNING' ? '#b84d886b' : '#3b8d7470';
  const max = Math.max(...values); const winner = values.indexOf(max); confidenceLabel.textContent = state === 'READY' ? '—' : `${(max * 100).toFixed(0)}% → ${winner}`;
  probabilityRoot.innerHTML = values.map((value, digit) => `<div class="prob-row ${digit === winner && state !== 'READY' ? 'top' : ''}" role="listitem"><span>${digit}</span><span class="prob-track"><span class="prob-fill" style="width:${Math.max(1, value * 100)}%"></span></span><span class="prob-value">${(value * 100).toFixed(1)}%</span></div>`).join('');
  latencyLabel.textContent = state === 'OOD WARNING' ? 'heuristic · outside training manifold' : state === 'READY' ? 'simulation · waiting for input' : 'simulation · 16ms';
}

function drawNetwork() {
  const width = networkCanvas.clientWidth; const height = networkCanvas.clientHeight; const scale = window.devicePixelRatio || 1;
  if (networkCanvas.width !== width * scale || networkCanvas.height !== height * scale) { networkCanvas.width = width * scale; networkCanvas.height = height * scale; }
  netCtx.setTransform(scale, 0, 0, scale, 0, 0); netCtx.clearRect(0, 0, width, height);
  const layers = [8, 15, 12, 10]; const positions = layers.map((count, layer) => Array.from({length:count}, (_, index) => ({x: width * [.08,.34,.64,.91][layer], y: height * (.18 + index * .64 / (count - 1))})));
  const pulse = (Math.sin(animationTime * .003) + 1) / 2; const warning = inputMode === 'nonsense';
  positions.slice(0, -1).forEach((layer, layerIndex) => layer.forEach((from, index) => positions[layerIndex + 1].forEach((to, targetIndex) => {
    const strength = ((index * 7 + targetIndex * 3 + layerIndex) % 11) / 11; const active = ((index + targetIndex + Math.floor(animationTime / 260)) % 9) < (warning ? 1 : 3);
    netCtx.beginPath(); netCtx.moveTo(from.x, from.y); netCtx.lineTo(to.x, to.y); netCtx.lineWidth = active ? 1.15 : .45; netCtx.strokeStyle = active ? (warning ? `rgba(243,120,189,${.38 + pulse * .35})` : `rgba(101,217,255,${.4 + pulse * .35})`) : `rgba(91,114,160,${.07 + strength * .08})`; netCtx.stroke();
  })));
  positions.forEach((layer, layerIndex) => layer.forEach((node, index) => { const active = (index + layerIndex + Math.floor(animationTime / 400)) % 7 === 0 || layerIndex === 3 && probabilities[index] > .1; netCtx.beginPath(); netCtx.arc(node.x, node.y, layerIndex === 3 ? 4 : 3, 0, Math.PI * 2); netCtx.fillStyle = active ? (warning ? '#f378bd' : '#65d9ff') : '#53688f'; netCtx.shadowColor = active ? (warning ? '#f378bd' : '#65d9ff') : 'transparent'; netCtx.shadowBlur = active ? 14 : 0; netCtx.fill(); netCtx.shadowBlur = 0; }));
  animationTime += 16; requestAnimationFrame(drawNetwork);
}

drawCanvas.addEventListener('pointerdown', event => { drawing = true; drawCanvas.setPointerCapture(event.pointerId); lastPoint = null; drawStroke(pointerPoint(event)); inputMode = 'drawn'; setProbabilities([.1,.1,.1,.1,.1,.1,.1,.1,.1,.1], 'DRAWING'); });
drawCanvas.addEventListener('pointermove', event => { if (drawing) drawStroke(pointerPoint(event)); });
drawCanvas.addEventListener('pointerup', () => { drawing = false; lastPoint = null; if (inputMode === 'drawn') { const values = [.03,.04,.06,.04,.15,.36,.08,.06,.07,.11]; setProbabilities(values, 'INFERENCE'); } });
drawCanvas.addEventListener('contextmenu', event => { event.preventDefault(); clearCanvas(); });
document.getElementById('clear-btn').addEventListener('click', clearCanvas);
document.getElementById('demo-btn').addEventListener('click', () => loadDigit(5));
document.getElementById('noise-btn').addEventListener('click', loadNonsense);
document.querySelectorAll('[data-digit]').forEach(button => button.addEventListener('click', () => loadDigit(Number(button.dataset.digit))));

clearCanvas(); loadDigit(5); drawNetwork();
