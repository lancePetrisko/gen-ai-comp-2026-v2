/* =============================================
   Chart Rendering — Donut & Bar charts via Canvas
   ============================================= */

const CHART_COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#65a30d'];
const EXTRUDE_PX = 9; // how far a hovered slice pops out

// Stores slice geometry + state per canvas
const _donutSliceData = {};

function countBy(arr, fn) {
  const counts = {};
  arr.forEach(item => {
    const key = fn(item);
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

// requestsMap is optional: { label: [request, ...] } — enables hover & click interactions
function drawDonut(canvasId, legendId, data, requestsMap) {
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
  const slices = [];
  entries.forEach(([label, count], i) => {
    const sweep = (count / total) * Math.PI * 2;
    const color = CHART_COLORS[i % CHART_COLORS.length];
    slices.push({
      label, count, color,
      startAngle: angle, endAngle: angle + sweep,
      requests: requestsMap ? (requestsMap[label] || []) : []
    });
    angle += sweep;
  });

  // Draw slices (non-hovered only; hovered drawn last so it sits on top)
  _paintSlices(ctx, slices, cx, cy, r, inner, total, -1);

  // Legend
  const legend = document.getElementById(legendId);
  legend.innerHTML = slices.map(s => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${s.color};"></span>
      ${escHtml(s.label)} (${s.count})
    </div>
  `).join('');

  // Wire up interactions if requestsMap provided
  if (requestsMap) {
    _donutSliceData[canvasId] = { slices, cx, cy, r, inner, total, hoveredIndex: -1 };

    if (canvas._chartClickHandler)     canvas.removeEventListener('click',     canvas._chartClickHandler);
    if (canvas._chartMoveHandler)      canvas.removeEventListener('mousemove', canvas._chartMoveHandler);
    if (canvas._chartLeaveHandler)     canvas.removeEventListener('mouseleave',canvas._chartLeaveHandler);

    canvas._chartClickHandler  = (e) => handleDonutClick(e, canvasId);
    canvas._chartMoveHandler   = (e) => handleDonutMouseMove(e, canvasId);
    canvas._chartLeaveHandler  = ()  => handleDonutMouseLeave(canvasId);

    canvas.addEventListener('click',      canvas._chartClickHandler);
    canvas.addEventListener('mousemove',  canvas._chartMoveHandler);
    canvas.addEventListener('mouseleave', canvas._chartLeaveHandler);
    canvas.style.cursor = 'pointer';
  }
}

// Paint all slices onto ctx; hoveredIndex slice is extruded and drawn last
function _paintSlices(ctx, slices, cx, cy, r, inner, total, hoveredIndex) {
  ctx.clearRect(0, 0, 240, 240);

  // Draw non-hovered slices first
  slices.forEach((s, i) => {
    if (i === hoveredIndex) return;
    _drawSlice(ctx, s, cx, cy, r, 0, 0);
  });

  // Draw hovered slice on top with extrusion
  if (hoveredIndex >= 0 && hoveredIndex < slices.length) {
    const s = slices[hoveredIndex];
    const mid = (s.startAngle + s.endAngle) / 2;
    const ox = Math.cos(mid) * EXTRUDE_PX;
    const oy = Math.sin(mid) * EXTRUDE_PX;
    _drawSlice(ctx, s, cx, cy, r, ox, oy);
  }

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
}

function _drawSlice(ctx, s, cx, cy, r, ox, oy) {
  ctx.beginPath();
  ctx.moveTo(cx + ox, cy + oy);
  ctx.arc(cx + ox, cy + oy, r, s.startAngle, s.endAngle);
  ctx.closePath();
  ctx.fillStyle = s.color;
  ctx.fill();
}

// Shared hit-test: returns slice index under cursor, or -1
function _hitTestDonut(e, canvasId) {
  const state = _donutSliceData[canvasId];
  if (!state) return -1;
  const canvas = document.getElementById(canvasId);
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (240 / rect.width) - state.cx;
  const y = (e.clientY - rect.top)  * (240 / rect.height) - state.cy;
  const dist = Math.sqrt(x * x + y * y);
  if (dist < state.inner || dist > state.r) return -1;
  let angle = Math.atan2(y, x);
  if (angle < -Math.PI / 2) angle += 2 * Math.PI;
  return state.slices.findIndex(s => angle >= s.startAngle && angle < s.endAngle);
}

// ---- Hover ----
function handleDonutMouseMove(e, canvasId) {
  const state = _donutSliceData[canvasId];
  if (!state) return;
  const idx = _hitTestDonut(e, canvasId);

  if (idx !== state.hoveredIndex) {
    state.hoveredIndex = idx;
    _paintSlices(
      document.getElementById(canvasId).getContext('2d'),
      state.slices, state.cx, state.cy, state.r, state.inner, state.total, idx
    );
  }

  if (idx >= 0) {
    showChartTooltip(state.slices[idx], state.total, e);
  } else {
    hideChartTooltip();
  }
}

function handleDonutMouseLeave(canvasId) {
  const state = _donutSliceData[canvasId];
  if (!state || state.hoveredIndex === -1) return;
  state.hoveredIndex = -1;
  _paintSlices(
    document.getElementById(canvasId).getContext('2d'),
    state.slices, state.cx, state.cy, state.r, state.inner, state.total, -1
  );
  hideChartTooltip();
}

// ---- Tooltip ----
function _getTooltipEl() {
  let el = document.getElementById('chart-hover-tooltip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'chart-hover-tooltip';
    el.className = 'chart-hover-tooltip';
    document.body.appendChild(el);
  }
  return el;
}

function showChartTooltip(slice, total, e) {
  const el = _getTooltipEl();
  const pct = Math.round((slice.count / total) * 100);
  const preview = slice.requests.slice(0, 4).map(r =>
    `<div class="cht-case"><strong>${r.id}</strong> · ${escHtml(r.eventName)}</div>`
  ).join('');
  const more = slice.requests.length > 4
    ? `<div class="cht-more">…and ${slice.requests.length - 4} more</div>` : '';

  el.innerHTML = `
    <div class="cht-header">
      <span class="cht-dot" style="background:${slice.color};"></span>
      <span class="cht-label">${escHtml(slice.label)}</span>
    </div>
    <div class="cht-count">${slice.count} case${slice.count !== 1 ? 's' : ''} · ${pct}%</div>
    <div class="cht-cases">${preview}${more}</div>
  `;
  el.classList.add('visible');
  _positionTooltip(el, e);
}

function _positionTooltip(el, e) {
  const PAD = 14;
  const vw = window.innerWidth, vh = window.innerHeight;
  const tw = el.offsetWidth || 220, th = el.offsetHeight || 120;
  let left = e.clientX + PAD;
  let top  = e.clientY + PAD;
  if (left + tw > vw - 8) left = e.clientX - tw - PAD;
  if (top  + th > vh - 8) top  = e.clientY - th - PAD;
  el.style.left = left + 'px';
  el.style.top  = top  + 'px';
}

function hideChartTooltip() {
  const el = document.getElementById('chart-hover-tooltip');
  if (el) el.classList.remove('visible');
}

// ---- Click (opens full drilldown modal) ----
function handleDonutClick(e, canvasId) {
  const idx = _hitTestDonut(e, canvasId);
  if (idx < 0) return;
  const state = _donutSliceData[canvasId];
  const slice = state.slices[idx];
  hideChartTooltip();
  showChartDrilldown(slice.label, slice.requests, slice.color);
}

function showChartDrilldown(label, requests, color) {
  let overlay = document.getElementById('chart-drilldown-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'chart-drilldown-overlay';
    overlay.className = 'chart-drilldown-overlay';
    overlay.innerHTML = `
      <div class="chart-drilldown" role="dialog" aria-modal="true">
        <div class="chart-drilldown-header">
          <h3 id="chart-drilldown-title"></h3>
          <button class="btn-close" id="chart-drilldown-close" aria-label="Close">&times;</button>
        </div>
        <div class="chart-drilldown-body" id="chart-drilldown-body"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('chart-drilldown-close').addEventListener('click', closeChartDrilldown);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeChartDrilldown(); });
  }

  document.getElementById('chart-drilldown-title').innerHTML =
    `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${color};margin-right:0.5rem;vertical-align:middle;"></span>${escHtml(label)} <span style="font-weight:400;font-size:0.85rem;color:var(--c-text-secondary);">(${requests.length} case${requests.length !== 1 ? 's' : ''})</span>`;

  const body = document.getElementById('chart-drilldown-body');
  if (requests.length === 0) {
    body.innerHTML = '<p style="color:var(--c-text-secondary);text-align:center;padding:1.5rem;">No cases found.</p>';
  } else {
    body.innerHTML = `
      <table class="drilldown-table">
        <thead><tr><th>ID</th><th>Event</th><th>Organization</th><th>Date</th><th>Status</th><th>Priority</th></tr></thead>
        <tbody>${requests.map(r => `
          <tr>
            <td><strong>${r.id}</strong></td>
            <td>${escHtml(r.eventName)}</td>
            <td>${escHtml(r.organization)}</td>
            <td>${formatDate(r.eventDate)}</td>
            <td>${statusBadge(r.status)}</td>
            <td>${priorityBadge(r.adminPriority || r.aiPriority)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    `;
  }

  overlay.classList.add('visible');
}

function closeChartDrilldown() {
  const overlay = document.getElementById('chart-drilldown-overlay');
  if (overlay) overlay.classList.remove('visible');
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
