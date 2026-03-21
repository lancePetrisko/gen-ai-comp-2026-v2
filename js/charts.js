/* =============================================
   Chart Rendering — Donut & Bar charts via Canvas
   ============================================= */

const CHART_COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#65a30d'];

function countBy(arr, fn) {
  const counts = {};
  arr.forEach(item => {
    const key = fn(item);
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

function drawDonut(canvasId, legendId, data) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const entries = Object.entries(data);
  const total = entries.reduce((s, e) => s + e[1], 0);

  const dpr = window.devicePixelRatio || 1;
  canvas.width = 240 * dpr;
  canvas.height = 240 * dpr;
  ctx.scale(dpr, dpr);

  const cx = 120, cy = 120, r = 90, inner = 55;
  ctx.clearRect(0, 0, 240, 240);

  if (total === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#e2e5ea';
    ctx.fill();
    return;
  }

  let angle = -Math.PI / 2;
  entries.forEach(([label, count], i) => {
    const slice = (count / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = CHART_COLORS[i % CHART_COLORS.length];
    ctx.fill();
    angle += slice;
  });

  // Donut hole
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Center text
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 24px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(total.toString(), cx, cy - 8);
  ctx.font = '11px -apple-system, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('total', cx, cy + 12);

  // Legend
  const legend = document.getElementById(legendId);
  legend.innerHTML = entries.map(([label, count], i) => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${CHART_COLORS[i % CHART_COLORS.length]};"></span>
      ${escHtml(label)} (${count})
    </div>
  `).join('');
}

function drawBarChart() {
  const canvas = document.getElementById('chart-workload');
  const ctx = canvas.getContext('2d');

  const dpr = window.devicePixelRatio || 1;
  canvas.width = 600 * dpr;
  canvas.height = 200 * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, 600, 200);

  const weeks = {};
  Store.requests.forEach(r => {
    const d = new Date(r.eventDate);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().split('T')[0];
    weeks[key] = (weeks[key] || 0) + 1;
  });

  const entries = Object.entries(weeks).sort((a, b) => a[0].localeCompare(b[0]));
  if (entries.length === 0) return;

  const maxVal = Math.max(...entries.map(e => e[1]));
  const barW = Math.min(50, (580 / entries.length) - 10);
  const chartH = 160;
  const startX = 10;

  entries.forEach(([week, count], i) => {
    const x = startX + i * (barW + 10);
    const h = (count / maxVal) * chartH;
    const y = chartH - h + 10;

    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    roundRect(ctx, x, y, barW, h, 4);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 11px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(count.toString(), x + barW / 2, y - 5);

    ctx.fillStyle = '#64748b';
    ctx.font = '10px -apple-system, sans-serif';
    const label = new Date(week + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    ctx.fillText(label, x + barW / 2, chartH + 25);
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}
