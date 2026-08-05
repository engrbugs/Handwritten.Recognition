const canvas = document.getElementById('curve-canvas');
const ctx = canvas.getContext('2d');
const slider = document.getElementById('h-slider');
const hValue = document.getElementById('h-value');
const slopeValue = document.getElementById('slope-value');

function f(x) { return 0.22 * x * x + 0.6; }
function df(x) { return 0.44 * x; }

function drawCurve() {
  const width = canvas.clientWidth; const height = canvas.clientHeight; const scale = window.devicePixelRatio || 1;
  if (canvas.width !== width * scale || canvas.height !== height * scale) { canvas.width = width * scale; canvas.height = height * scale; }
  ctx.setTransform(scale, 0, 0, scale, 0, 0); ctx.clearRect(0, 0, width, height);
  const pad = {left:58,right:24,top:24,bottom:48}; const plotW = width - pad.left - pad.right; const plotH = height - pad.top - pad.bottom;
  const xMin = -3.6; const xMax = 3.8; const yMin = 0; const yMax = 4.4;
  const px = x => pad.left + (x - xMin) / (xMax - xMin) * plotW; const py = y => height - pad.bottom - (y - yMin) / (yMax - yMin) * plotH;
  ctx.strokeStyle = 'rgba(124,153,210,.12)'; ctx.lineWidth = 1;
  for (let x=-3; x<=3; x++) { ctx.beginPath(); ctx.moveTo(px(x),py(yMin)); ctx.lineTo(px(x),py(yMax)); ctx.stroke(); }
  for (let y=0; y<=4; y++) { ctx.beginPath(); ctx.moveTo(px(xMin),py(y)); ctx.lineTo(px(xMax),py(y)); ctx.stroke(); }
  ctx.fillStyle = '#7d8eae'; ctx.font = '11px ui-monospace, monospace';
  for (let x=-3; x<=3; x++) ctx.fillText(String(x),px(x)-4,height-18);
  for (let y=1; y<=4; y++) ctx.fillText(String(y),22,py(y)+4);
  ctx.strokeStyle = '#7285aa'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(px(xMin),py(0)); ctx.lineTo(px(xMax),py(0)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(px(0),py(yMin)); ctx.lineTo(px(0),py(yMax)); ctx.stroke();
  ctx.strokeStyle = '#64d8ff'; ctx.lineWidth = 2.2; ctx.beginPath(); for(let x=xMin;x<=xMax;x+=.03){const y=f(x);if(x===xMin)ctx.moveTo(px(x),py(y));else ctx.lineTo(px(x),py(y));} ctx.stroke();
  const a = 1.8; const h = Number(slider.value); const b = a + h; const fa=f(a); const fb=f(b); const secant=(fb-fa)/h; const tangent=df(a);
  const tangentY = x => fa + tangent*(x-a); const secantY = x => fa + secant*(x-a);
  ctx.strokeStyle = '#45e9a3'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(px(xMin),py(tangentY(xMin))); ctx.lineTo(px(xMax),py(tangentY(xMax))); ctx.stroke();
  ctx.strokeStyle = '#f378bd'; ctx.lineWidth = 1.6; ctx.setLineDash([7,6]); ctx.beginPath(); ctx.moveTo(px(xMin),py(secantY(xMin))); ctx.lineTo(px(xMax),py(secantY(xMax))); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = '#8ba7d5'; ctx.lineWidth = 1; ctx.setLineDash([3,4]); ctx.beginPath(); ctx.moveTo(px(a),py(0)); ctx.lineTo(px(a),py(fa)); ctx.moveTo(px(b),py(0)); ctx.lineTo(px(b),py(fb)); ctx.moveTo(px(a),py(fa)); ctx.lineTo(px(b),py(fa)); ctx.lineTo(px(b),py(fb)); ctx.stroke(); ctx.setLineDash([]);
  [[a,fa,'a'],[b,fb,'a + h']].forEach(([x,y,label],index)=>{ctx.beginPath();ctx.arc(px(x),py(y),5,0,Math.PI*2);ctx.fillStyle=index?'#f378bd':'#fff';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=12;ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#b1c1dc';ctx.font='12px ui-monospace,monospace';ctx.fillText(label,px(x)+9,py(y)-9);});
  ctx.fillStyle='#63d9ff';ctx.font='12px ui-monospace,monospace';ctx.fillText('Δy',px(b)+8,(py(fa)+py(fb))/2);ctx.fillText('Δx = h',px(a)+4,py(fa)+22);
  hValue.value = `h = ${h.toFixed(2)}`; slopeValue.textContent = `secant slope = ${secant.toFixed(2)} · tangent = ${tangent.toFixed(2)}`;
}

slider.addEventListener('input', drawCurve); window.addEventListener('resize', drawCurve); drawCurve();
