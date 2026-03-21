/* =============================================
   Minimap — canvas-based event location map
   Illinois-region, no external dependencies
   ============================================= */

// Polyfill roundRect for older browsers
(function () {
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      this.beginPath();
      this.moveTo(x + r, y);
      this.lineTo(x + w - r, y);
      this.arcTo(x + w, y, x + w, y + r, r);
      this.lineTo(x + w, y + h - r);
      this.arcTo(x + w, y + h, x + w - r, y + h, r);
      this.lineTo(x + r, y + h);
      this.arcTo(x, y + h, x, y + h - r, r);
      this.lineTo(x, y + r);
      this.arcTo(x, y, x + r, y, r);
      this.closePath();
      return this;
    };
  }
})();

/* ---- City coordinate lookup ---- */
const CITY_COORDS = {
  'Springfield':    { lat: 39.78, lng: -89.65 },
  'Carlinville':    { lat: 39.28, lng: -89.88 },
  'Decatur':        { lat: 39.84, lng: -88.95 },
  'Champaign':      { lat: 40.12, lng: -88.24 },
  'St. Louis':      { lat: 38.63, lng: -90.19 },
  'Bloomington':    { lat: 40.48, lng: -88.99 },
  'Chicago':        { lat: 41.88, lng: -87.63 },
  'Carbondale':     { lat: 37.73, lng: -89.22 },
  'East St. Louis': { lat: 38.62, lng: -90.15 },
  'Normal':         { lat: 40.51, lng: -88.99 },
  'Peoria':         { lat: 40.69, lng: -89.59 },
  'Rockford':       { lat: 42.27, lng: -89.09 },
  'Joliet':         { lat: 41.52, lng: -88.08 },
  'Naperville':     { lat: 41.79, lng: -88.15 },
  'Aurora':         { lat: 41.76, lng: -88.32 }
};

/* ---- Map viewport bounds ---- */
const MAP_BOUNDS = { minLat: 36.6, maxLat: 42.8, minLng: -91.5, maxLng: -87.0 };

/* ---- Simplified Illinois border (lat/lng points) ---- */
const IL_OUTLINE = [
  { lat: 42.49, lng: -87.80 }, // NE — Lake Michigan corner
  { lat: 42.49, lng: -88.70 },
  { lat: 42.49, lng: -89.40 },
  { lat: 42.50, lng: -90.64 }, // NW
  { lat: 42.21, lng: -90.64 },
  { lat: 41.77, lng: -90.18 },
  { lat: 41.44, lng: -90.45 },
  { lat: 40.64, lng: -91.40 }, // Mississippi River, west
  { lat: 39.94, lng: -91.41 },
  { lat: 39.32, lng: -91.37 },
  { lat: 38.96, lng: -90.94 },
  { lat: 38.63, lng: -90.24 }, // St. Louis confluence
  { lat: 37.96, lng: -89.52 },
  { lat: 37.00, lng: -89.17 }, // Cairo — southern tip
  { lat: 36.99, lng: -88.07 },
  { lat: 37.09, lng: -87.91 }, // Kentucky border
  { lat: 37.40, lng: -87.91 },
  { lat: 38.00, lng: -87.62 }, // Indiana border
  { lat: 38.96, lng: -87.52 },
  { lat: 39.61, lng: -87.53 },
  { lat: 40.49, lng: -87.53 },
  { lat: 41.77, lng: -87.52 },
  { lat: 42.49, lng: -87.80 }  // back to NE
];

/* ---- Missouri stub (to show St. Louis isn't floating) ---- */
const MO_STUB = [
  { lat: 38.96, lng: -90.94 },
  { lat: 38.63, lng: -90.24 },
  { lat: 38.25, lng: -90.47 },
  { lat: 38.09, lng: -90.72 },
  { lat: 38.96, lng: -90.94 }
];

/* ---- Coordinate projection helpers ---- */
function latLngToXY(lat, lng, W, H) {
  const { minLat, maxLat, minLng, maxLng } = MAP_BOUNDS;
  const x = ((lng - minLng) / (maxLng - minLng)) * W;
  const y = ((maxLat - lat) / (maxLat - minLat)) * H;
  return { x, y };
}

function getReqCoords(req) {
  const city = (req.city || '').trim();
  if (CITY_COORDS[city]) return CITY_COORDS[city];
  const key = Object.keys(CITY_COORDS).find(
    k => city.toLowerCase().includes(k.toLowerCase()) ||
         k.toLowerCase().includes(city.toLowerCase())
  );
  return key ? CITY_COORDS[key] : null;
}

/* ---- Pin color by days until event ---- */
function pinColor(eventDate) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const ev = new Date(eventDate); ev.setHours(0, 0, 0, 0);
  const days = Math.round((ev - today) / 86400000);
  if (days < 0)   return '#94a3b8'; // past — slate
  if (days <= 7)  return '#ef4444'; // this week — red
  if (days <= 14) return '#f97316'; // 1–2 weeks — orange
  if (days <= 30) return '#eab308'; // this month — yellow
  return '#22c55e';                  // 30+ days — green
}

function daysLabel(eventDate) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const ev = new Date(eventDate); ev.setHours(0, 0, 0, 0);
  const days = Math.round((ev - today) / 86400000);
  if (days < 0)   return `${Math.abs(days)}d ago`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `in ${days}d`;
}

/* ---- Legend config ---- */
const LEGEND = [
  { color: '#ef4444', label: 'This week'   },
  { color: '#f97316', label: '1–2 weeks'   },
  { color: '#eab308', label: 'This month'  },
  { color: '#22c55e', label: '30+ days'    },
  { color: '#94a3b8', label: 'Past'        },
  { color: '#2563eb', label: 'Selected'    }
];

/* ---- Draw a single pin ---- */
function drawPin(ctx, x, y, color, radius, selected) {
  // Drop shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  if (selected) {
    // Glow ring
    ctx.beginPath();
    ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(37,99,235,0.18)';
    ctx.fill();
    // White outline
    ctx.beginPath();
    ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();

  // Inner shine
  ctx.beginPath();
  ctx.arc(x - radius * 0.28, y - radius * 0.28, radius * 0.32, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fill();
}

/* ---- Draw state outlines ---- */
function drawOutline(ctx, points, fillColor, strokeColor, W, H) {
  ctx.beginPath();
  points.forEach(({ lat, lng }, i) => {
    const { x, y } = latLngToXY(lat, lng, W, H);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

/* ---- Draw legend ---- */
function drawLegend(ctx, W, H) {
  const pad = 7, dotR = 5, lineH = 16;
  const boxW = 94, boxH = LEGEND.length * lineH + pad * 2;
  const bx = W - boxW - 6, by = H - boxH - 6;

  ctx.fillStyle = 'rgba(255,255,255,0.90)';
  ctx.roundRect(bx, by, boxW, boxH, 6);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textBaseline = 'middle';
  LEGEND.forEach(({ color, label }, i) => {
    const cy = by + pad + i * lineH + lineH / 2;
    ctx.beginPath();
    ctx.arc(bx + pad + dotR, cy, dotR, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(label, bx + pad + dotR * 2 + 5, cy);
  });
}

/* ---- Core draw function — returns pin array ---- */
function drawMapBase(canvas, selectedReq) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Sky-blue background (represents surrounding water/area)
  ctx.fillStyle = '#bfdbfe';
  ctx.fillRect(0, 0, W, H);

  // Missouri stub
  drawOutline(ctx, MO_STUB, '#e2e8f0', '#94a3b8', W, H);

  // Illinois
  drawOutline(ctx, IL_OUTLINE, '#f1f5f9', '#64748b', W, H);

  // Collect all pins
  const pins = Store.requests.map(req => {
    const coords = getReqCoords(req);
    if (!coords) return null;
    const { x, y } = latLngToXY(coords.lat, coords.lng, W, H);
    return { req, x, y };
  }).filter(Boolean);

  // Draw non-selected pins first
  pins.forEach(({ req, x, y }) => {
    if (req.id === selectedReq.id) return;
    drawPin(ctx, x, y, pinColor(req.eventDate), 7, false);
  });

  // Selected pin on top
  const selCoords = getReqCoords(selectedReq);
  if (selCoords) {
    const { x, y } = latLngToXY(selCoords.lat, selCoords.lng, W, H);
    drawPin(ctx, x, y, '#2563eb', 10, true);
  }

  drawLegend(ctx, W, H);
  return pins;
}

/* ---- Tooltip draw ---- */
function drawTooltip(ctx, pin, selectedReq, W, H) {
  const { req, x, y } = pin;
  const isSelected = req.id === selectedReq.id;

  // Enlarge pin on hover
  const hoverR = isSelected ? 13 : 11;
  drawPin(ctx, x, y, isSelected ? '#2563eb' : pinColor(req.eventDate), hoverR, isSelected);

  // Tooltip content
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const ev = new Date(req.eventDate); ev.setHours(0, 0, 0, 0);
  const days = Math.round((ev - today) / 86400000);
  const lines = [
    { text: req.eventName,    bold: true,  color: '#fff'     },
    { text: req.city,         bold: false, color: '#94a3b8'  },
    { text: `${formatDate(req.eventDate)} · ${daysLabel(req.eventDate)}`, bold: false, color: '#cbd5e1' }
  ];

  const tPad = 9, lineH = 16;
  ctx.font = 'bold 11px system-ui, sans-serif';
  const maxW = Math.max(...lines.map(l => ctx.measureText(l.text).width));
  const tW = maxW + tPad * 2;
  const tH = lines.length * lineH + tPad * 2;

  let tx = x + 15;
  let ty = y - tH / 2;
  if (tx + tW > W - 6) tx = x - tW - 15;
  if (ty < 4)          ty = 4;
  if (ty + tH > H - 4) ty = H - tH - 4;

  // Box
  ctx.fillStyle = 'rgba(15,23,42,0.93)';
  ctx.roundRect(tx, ty, tW, tH, 7);
  ctx.fill();

  // Text
  ctx.textBaseline = 'top';
  lines.forEach(({ text, bold, color }, i) => {
    ctx.font = (bold ? 'bold ' : '') + '11px system-ui, sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(text, tx + tPad, ty + tPad + i * lineH);
  });
}

/* ---- Public: init minimap on a canvas element ---- */
function initMinimap(canvas, selectedReq) {
  let pins = drawMapBase(canvas, selectedReq);
  let hovered = null;

  function redraw(hoverPin) {
    drawMapBase(canvas, selectedReq);
    if (hoverPin) {
      const ctx = canvas.getContext('2d');
      drawTooltip(ctx, hoverPin, selectedReq, canvas.width, canvas.height);
    }
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top)  * scaleY;

    const hit = pins.find(p => Math.hypot(mx - p.x, my - p.y) <= 12) || null;
    if (hit !== hovered) {
      hovered = hit;
      redraw(hovered);
      canvas.style.cursor = hit ? 'pointer' : 'default';
    }
  });

  canvas.addEventListener('mouseleave', () => {
    if (hovered) { hovered = null; redraw(null); }
  });
}
