const drawCanvas = document.getElementById('draw-canvas');
const networkCanvas = document.getElementById('network-canvas');
const drawCtx = drawCanvas.getContext('2d');
const netCtx = networkCanvas.getContext('2d');
const probabilityRoot = document.getElementById('probabilities');
const statePill = document.getElementById('network-state');
const confidenceLabel = document.getElementById('confidence-label');
const latencyLabel = document.getElementById('latency');

const digitPatterns = {
  0:['01110','10001','10011','10101','11001','10001','01110'], 1:['00100','01100','00100','00100','00100','00100','01110'],
  2:['01110','10001','00001','00010','00100','01000','11111'], 3:['11110','00001','00001','01110','00001','00001','11110'],
  4:['00010','00110','01010','10010','11111','00010','00010'], 5:['11111','10000','10000','11110','00001','00001','11110'],
  6:['01110','10000','10000','11110','10001','10001','01110'], 7:['11111','00001','00010','00100','01000','01000','01000'],
  8:['01110','10001','10001','01110','10001','10001','01110'], 9:['01110','10001','10001','01111','00001','00001','01110']
};

let probabilities = Array(10).fill(.1);
let inputMode = 'digit';
let drawing = false;
let lastPoint = null;
let networkState = { input:Array(35).fill(0), hidden1:Array(15).fill(0), hidden2:Array(12).fill(0), output:probabilities };

function clearCanvas() {
  drawCtx.fillStyle = '#080e1e'; drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
  drawCtx.strokeStyle = 'rgba(78,145,255,.09)'; drawCtx.lineWidth = 1;
  for (let i = 10; i < 280; i += 10) { drawCtx.beginPath(); drawCtx.moveTo(i, 0); drawCtx.lineTo(i, 280); drawCtx.stroke(); drawCtx.beginPath(); drawCtx.moveTo(0, i); drawCtx.lineTo(280, i); drawCtx.stroke(); }
  inputMode = 'blank'; setProbabilities(Array(10).fill(.1), 'READY', Array(35).fill(0));
}

function pointerPoint(event) { const rect = drawCanvas.getBoundingClientRect(); return { x:(event.clientX - rect.left) * drawCanvas.width / rect.width, y:(event.clientY - rect.top) * drawCanvas.height / rect.height }; }

function drawStroke(point) {
  drawCtx.strokeStyle = '#55f0ad'; drawCtx.shadowColor = '#28d99a'; drawCtx.shadowBlur = 12; drawCtx.lineCap = 'round'; drawCtx.lineJoin = 'round'; drawCtx.lineWidth = 13;
  drawCtx.beginPath(); if (lastPoint) { drawCtx.moveTo(lastPoint.x, lastPoint.y); drawCtx.lineTo(point.x, point.y); } else { drawCtx.moveTo(point.x, point.y); drawCtx.lineTo(point.x + .1, point.y + .1); } drawCtx.stroke(); drawCtx.shadowBlur = 0; lastPoint = point;
}

function loadDigit(digit) {
  clearCanvas(); const pattern = digitPatterns[digit]; const cell = 28;
  drawCtx.strokeStyle = '#55f0ad'; drawCtx.shadowColor = '#28d99a'; drawCtx.shadowBlur = 14; drawCtx.lineWidth = 13; drawCtx.lineCap = 'round'; drawCtx.lineJoin = 'round';
  pattern.forEach((row, y) => row.split('').forEach((value, x) => { if (value !== '1') return; drawCtx.beginPath(); drawCtx.moveTo(42 + x * cell, 48 + y * cell); drawCtx.lineTo(42 + x * cell + .1, 48 + y * cell + .1); drawCtx.stroke(); }));
  drawCtx.shadowBlur = 0; inputMode = 'digit';
  // Demo templates have an exact 5 × 7 representation, so the displayed digit
  // and the features entering the network are the same data—not a hardcoded label.
  const features = pattern.flatMap(row => row.split('').map(Number));
  setProbabilities(runForwardPass(features), 'INFERENCE', features); selectDigitButton(digit);
}

function loadNonsense() {
  clearCanvas(); drawCtx.strokeStyle = '#f378bd'; drawCtx.shadowColor = '#e73b9e'; drawCtx.shadowBlur = 18; drawCtx.lineWidth = 11; drawCtx.lineCap = 'round';
  const points = [[40,52],[96,48],[63,91],[136,118],[42,157],[100,184],[194,154],[155,224],[232,232],[184,77],[224,54],[198,114]];
  drawCtx.beginPath(); points.forEach(([x,y], index) => index ? drawCtx.lineTo(x,y) : drawCtx.moveTo(x,y)); drawCtx.stroke(); drawCtx.shadowBlur = 0; inputMode = 'nonsense';
  const features = extractFeatures(); setProbabilities(runForwardPass(features), 'OOD WARNING', features);
}

function selectDigitButton(digit) { document.querySelectorAll('[data-digit]').forEach(button => button.classList.toggle('selected', button.dataset.digit === String(digit))); }

// Reduce the 280px canvas to the same 5 × 7 feature grid used by the forward pass.
function extractFeatures() {
  const pixels = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height).data; const ink = [];
  for (let y = 0; y < drawCanvas.height; y += 2) for (let x = 0; x < drawCanvas.width; x += 2) {
    const i = (y * drawCanvas.width + x) * 4; const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    if ((g > 100 && g > r * 1.25 && g > b * .8) || (r > 130 && r > g * 1.2 && r > b * 1.1)) ink.push({x,y});
  }
  if (ink.length < 8) return Array(35).fill(0);
  const minX = Math.min(...ink.map(p => p.x)), maxX = Math.max(...ink.map(p => p.x)), minY = Math.min(...ink.map(p => p.y)), maxY = Math.max(...ink.map(p => p.y));
  const spanX = Math.max(1, maxX - minX), spanY = Math.max(1, maxY - minY);
  return Array.from({length:7}, (_, row) => Array.from({length:5}, (_, col) => {
    const left = minX + col / 5 * spanX, right = minX + (col + 1) / 5 * spanX, top = minY + row / 7 * spanY, bottom = minY + (row + 1) / 7 * spanY;
    return ink.filter(p => p.x >= left && p.x < right && p.y >= top && p.y < bottom).length / ink.length;
  })).flat();
}

function relu(value) { return Math.max(0, value); }
function softmax(values) { const peak = Math.max(...values); const exp = values.map(value => Math.exp(value - peak)); const total = exp.reduce((sum, value) => sum + value, 0); return exp.map(value => value / total); }

// A small, fixed educational network: 35 pixels → 15 features → 12 features → 10 classes.
// These are deliberately hand-designed weights, so the page demonstrates the math without implying a trained production model.
function runForwardPass(input) {
  const rows = Array.from({length:7}, (_, row) => input.slice(row * 5, row * 5 + 5).reduce((a,b) => a + b, 0) / 5);
  const cols = Array.from({length:5}, (_, col) => input.filter((_, i) => i % 5 === col).reduce((a,b) => a + b, 0) / 7);
  const density = input.reduce((a,b) => a + b, 0) / 35;
  const diagonal = input.reduce((sum, value, i) => sum + value * (i % 6 === 0 ? 1 : 0), 0) / 6;
  const lower = input.slice(20).reduce((a,b) => a + b, 0) / 15;
  const hidden1 = [...rows, ...cols, density, diagonal, lower].map(relu);
  const similarities = Object.values(digitPatterns).map(pattern => {
    const bits = pattern.join('').split('').map(Number); const ones = bits.reduce((sum, bit) => sum + bit, 0); const zeros = bits.length - ones;
    const hit = bits.reduce((sum, bit, i) => sum + bit * input[i], 0) / ones;
    const missing = bits.reduce((sum, bit, i) => sum + bit * (1 - input[i]), 0) / ones;
    const extra = bits.reduce((sum, bit, i) => sum + (1 - bit) * input[i], 0) / zeros;
    return Math.max(0, .5 + hit * .65 - missing * .2 - extra * .85);
  });
  const hidden2 = [...similarities, relu(density * 2), relu((lower + rows[6]) / 2)];
  const logits = hidden2.slice(0, 10).map((value, digit) => value * 18 + hidden2[10] * (digit === 0 || digit === 8 ? 1 : .15) + hidden2[11] * (digit === 1 || digit === 7 ? 1 : .12));
  return { probabilities:softmax(logits), input, hidden1, hidden2 };
}

function setProbabilities(values, state, input = networkState.input) {
  const result = values.probabilities ? values : runForwardPass(input); probabilities = result.probabilities; networkState = { input:result.input, hidden1:result.hidden1, hidden2:result.hidden2, output:result.probabilities };
  statePill.textContent = state; statePill.style.color = state === 'OOD WARNING' ? '#f378bd' : '#45e9a3'; statePill.style.borderColor = state === 'OOD WARNING' ? '#b84d886b' : '#3b8d7470';
  const max = Math.max(...probabilities), winner = probabilities.indexOf(max); confidenceLabel.textContent = state === 'READY' ? '—' : `${(max * 100).toFixed(0)}% → ${winner}`;
  probabilityRoot.innerHTML = probabilities.map((value, digit) => {
    const isWinner = digit === winner && state !== 'READY';
    return `<div class="prob-row ${isWinner ? 'top' : ''}" role="listitem" aria-label="Digit ${digit}: ${(value * 100).toFixed(1)} percent${isWinner ? ', highest probability' : ''}"><span class="prob-digit">${digit}</span><span class="prob-track"><span class="prob-fill" style="width:${Math.max(1, value * 100)}%"></span></span>${isWinner ? '<span class="winner-marker">highest</span>' : ''}<span class="prob-value">${(value * 100).toFixed(1)}%</span></div>`;
  }).join('');
  latencyLabel.textContent = state === 'OOD WARNING' ? 'signal flow · no OOD detector' : state === 'READY' ? 'signal flow · waiting for input' : 'signal flow · live'; renderNetwork();
}

function activationNodes(values, count) { return values.slice(0, count).map(value => Math.min(1, Math.max(0, value))); }
function edgeWeight(a, b, layer) { return (((a + 2) * 17 + (b + 3) * 11 + layer * 19) % 23 - 11) / 11; }

function renderNetwork() {
  const width = networkCanvas.clientWidth, height = networkCanvas.clientHeight, scale = window.devicePixelRatio || 1;
  if (networkCanvas.width !== width * scale || networkCanvas.height !== height * scale) { networkCanvas.width = width * scale; networkCanvas.height = height * scale; }
  netCtx.setTransform(scale, 0, 0, scale, 0, 0); netCtx.clearRect(0, 0, width, height);
  const input = Array.from({length:8}, (_, i) => networkState.input.slice(i * 4, i === 7 ? 35 : i * 4 + 4).reduce((a,b) => a + b, 0) / 4);
  const layers = [input, activationNodes(networkState.hidden1, 15), activationNodes(networkState.hidden2, 12), networkState.output];
  const positions = layers.map((layer, column) => Array.from({length:layer.length}, (_, index) => ({x:width * [.08,.34,.64,.91][column], y:height * (.18 + (layer.length === 1 ? .32 : index * .64 / (layer.length - 1)))})));
  const flow = (performance.now() % 1800) / 1800;
  positions.slice(0, -1).forEach((layer, layerIndex) => layer.forEach((from, index) => positions[layerIndex + 1].forEach((to, targetIndex) => {
    const activation = layers[layerIndex][index] * layers[layerIndex + 1][targetIndex]; const weight = edgeWeight(index, targetIndex, layerIndex); const strength = Math.min(1, activation * (.75 + Math.abs(weight) * .75));
    const pulsePosition = (flow + layerIndex * .24 + index * .013 + targetIndex * .007) % 1; const pulse = Math.max(0, 1 - Math.abs(pulsePosition - .5) * 4); const active = strength > .11; const visibleStrength = active ? Math.max(strength, strength * (.7 + pulse * 1.4)) : strength * .2;
    netCtx.beginPath(); netCtx.moveTo(from.x, from.y); netCtx.lineTo(to.x, to.y); netCtx.lineWidth = active ? .8 + visibleStrength * 2.4 : .35; netCtx.strokeStyle = weight >= 0 ? `rgba(101,217,255,${active ? .16 + visibleStrength * .84 : .025})` : `rgba(243,120,189,${active ? .13 + visibleStrength * .62 : .02})`; netCtx.stroke();
    if (active) { const px = from.x + (to.x - from.x) * pulsePosition, py = from.y + (to.y - from.y) * pulsePosition; netCtx.beginPath(); netCtx.arc(px, py, 2.8 + strength * 3.2 + pulse * 2, 0, Math.PI * 2); netCtx.fillStyle = weight >= 0 ? '#65d9ff' : '#f378bd'; netCtx.shadowColor = netCtx.fillStyle; netCtx.shadowBlur = 18 + pulse * 12; netCtx.fill(); netCtx.shadowBlur = 0; }
  })));
  positions.forEach((layer, layerIndex) => layer.forEach((node, index) => { const active = layers[layerIndex][index]; const radius = layerIndex === 3 ? 4.8 : 3.8; const color = inputMode === 'nonsense' && active > .35 ? '#f378bd' : '#65d9ff'; if (active > .12) { netCtx.beginPath(); netCtx.arc(node.x, node.y, radius + 5 + active * 4, 0, Math.PI * 2); netCtx.strokeStyle = `${color}55`; netCtx.lineWidth = 1; netCtx.stroke(); } netCtx.beginPath(); netCtx.arc(node.x, node.y, radius, 0, Math.PI * 2); netCtx.fillStyle = inputMode === 'nonsense' && active > .35 ? '#f378bd' : `rgba(101,217,255,${.42 + active * .58})`; netCtx.shadowColor = netCtx.fillStyle; netCtx.shadowBlur = active > .2 ? 20 : 0; netCtx.fill(); netCtx.shadowBlur = 0; }));
  requestAnimationFrame(renderNetwork);
}

drawCanvas.addEventListener('pointerdown', event => { drawing = true; drawCanvas.setPointerCapture(event.pointerId); lastPoint = null; drawStroke(pointerPoint(event)); inputMode = 'drawn'; setProbabilities(runForwardPass(extractFeatures()), 'DRAWING', extractFeatures()); });
drawCanvas.addEventListener('pointermove', event => { if (drawing) drawStroke(pointerPoint(event)); });
drawCanvas.addEventListener('pointerup', () => { drawing = false; lastPoint = null; if (inputMode === 'drawn') { const input = extractFeatures(); setProbabilities(runForwardPass(input), 'INFERENCE', input); } });
drawCanvas.addEventListener('contextmenu', event => { event.preventDefault(); clearCanvas(); });
document.getElementById('clear-btn').addEventListener('click', clearCanvas); document.getElementById('demo-btn').addEventListener('click', () => loadDigit(5)); document.getElementById('noise-btn').addEventListener('click', loadNonsense); document.querySelectorAll('[data-digit]').forEach(button => button.addEventListener('click', () => loadDigit(Number(button.dataset.digit))));
window.addEventListener('resize', renderNetwork);

clearCanvas(); loadDigit(5);
