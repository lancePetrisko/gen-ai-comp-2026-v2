/* =============================================
   Minimap — canvas Salt Lake City map
   Professional street-map style, no dependencies
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

/* =============================================
   MAP VIEWPORT  (SLC valley)
   ============================================= */
const MAP_BOUNDS = { minLat: 40.56, maxLat: 40.89, minLng: -112.09, maxLng: -111.70 };

/* =============================================
   ARBITRARY DEMO PIN POSITIONS  (SLC valley)
   — not tied to real addresses, spread for clarity
   ============================================= */
const DEMO_PIN_POSITIONS = [
  { lat: 40.762, lng: -111.893 }, //  0 — downtown core
  { lat: 40.726, lng: -111.920 }, //  1 — west side
  { lat: 40.776, lng: -111.858 }, //  2 — university / east bench
  { lat: 40.695, lng: -111.888 }, //  3 — south city
  { lat: 40.748, lng: -111.946 }, //  4 — west valley
  { lat: 40.802, lng: -111.889 }, //  5 — north SLC
  { lat: 40.754, lng: -111.836 }, //  6 — foothill bench
  { lat: 40.718, lng: -111.857 }, //  7 — millcreek area
  { lat: 40.669, lng: -111.900 }, //  8 — murray area
  { lat: 40.783, lng: -111.930 }, //  9 — NW / airport edge
  { lat: 40.627, lng: -111.872 }, // 10 — midvale / sandy
  { lat: 40.742, lng: -111.874 }, // 11 — central east
  { lat: 40.770, lng: -111.908 }, // 12 — near capitol
  { lat: 40.650, lng: -111.932 }, // 13 — taylorsville area
  { lat: 40.813, lng: -111.854 }, // 14 — sugarhouse heights
];

/* =============================================
   GEOGRAPHIC FEATURES
   ============================================= */

// Great Salt Lake (simplified shoreline, NW)
const GREAT_SALT_LAKE = [
  { lat: 40.89, lng: -112.09 },
  { lat: 40.89, lng: -111.97 },
  { lat: 40.86, lng: -111.95 },
  { lat: 40.83, lng: -111.97 },
  { lat: 40.80, lng: -112.00 },
  { lat: 40.77, lng: -112.05 },
  { lat: 40.74, lng: -112.09 },
  { lat: 40.89, lng: -112.09 },
];

// Wasatch Mountains — far east, dark green
const WASATCH = [
  { lat: 40.89, lng: -111.78 },
  { lat: 40.89, lng: -111.70 },
  { lat: 40.56, lng: -111.70 },
  { lat: 40.56, lng: -111.79 },
  { lat: 40.62, lng: -111.80 },
  { lat: 40.70, lng: -111.81 },
  { lat: 40.75, lng: -111.81 },
  { lat: 40.80, lng: -111.80 },
  { lat: 40.85, lng: -111.79 },
  { lat: 40.89, lng: -111.78 },
];

// Foothills / benches — lighter green strip between mountains and city
const FOOTHILLS = [
  { lat: 40.89, lng: -111.82 },
  { lat: 40.89, lng: -111.78 },
  { lat: 40.85, lng: -111.79 },
  { lat: 40.80, lng: -111.80 },
  { lat: 40.75, lng: -111.81 },
  { lat: 40.70, lng: -111.81 },
  { lat: 40.62, lng: -111.80 },
  { lat: 40.56, lng: -111.79 },
  { lat: 40.56, lng: -111.82 },
  { lat: 40.62, lng: -111.83 },
  { lat: 40.70, lng: -111.84 },
  { lat: 40.75, lng: -111.84 },
  { lat: 40.80, lng: -111.83 },
  { lat: 40.85, lng: -111.82 },
  { lat: 40.89, lng: -111.82 },
];

// Airport — light gray rectangle NW of downtown
const AIRPORT = [
  { lat: 40.800, lng: -111.995 },
  { lat: 40.800, lng: -111.963 },
  { lat: 40.785, lng: -111.961 },
  { lat: 40.783, lng: -111.995 },
  { lat: 40.800, lng: -111.995 },
];

// Parks — small green patches
const PARKS = [
  // Liberty Park
  [
    { lat: 40.728, lng: -111.875 },
    { lat: 40.728, lng: -111.862 },
    { lat: 40.721, lng: -111.862 },
    { lat: 40.721, lng: -111.875 },
  ],
  // Sugar House Park
  [
    { lat: 40.717, lng: -111.845 },
    { lat: 40.717, lng: -111.836 },
    { lat: 40.712, lng: -111.836 },
    { lat: 40.712, lng: -111.845 },
  ],
  // Jordan Park / west side park
  [
    { lat: 40.748, lng: -111.921 },
    { lat: 40.748, lng: -111.914 },
    { lat: 40.743, lng: -111.914 },
    { lat: 40.743, lng: -111.921 },
  ],
  // Memory Grove / city creek
  [
    { lat: 40.779, lng: -111.887 },
    { lat: 40.779, lng: -111.882 },
    { lat: 40.774, lng: -111.882 },
    { lat: 40.774, lng: -111.887 },
  ],
  // Rose Park area
  [
    { lat: 40.800, lng: -111.924 },
    { lat: 40.800, lng: -111.917 },
    { lat: 40.796, lng: -111.917 },
    { lat: 40.796, lng: -111.924 },
  ],
];

/* =============================================
   ROAD DATA
   ============================================= */

// Jordan River — meanders N-S through west valley
const JORDAN_RIVER = [
  { lat: 40.89, lng: -111.940 },
  { lat: 40.84, lng: -111.944 },
  { lat: 40.80, lng: -111.948 },
  { lat: 40.76, lng: -111.951 },
  { lat: 40.72, lng: -111.955 },
  { lat: 40.68, lng: -111.960 },
  { lat: 40.64, lng: -111.962 },
  { lat: 40.60, lng: -111.965 },
  { lat: 40.56, lng: -111.967 },
];

// I-15 — N-S, just west of downtown
const I15 = [
  { lat: 40.89, lng: -111.900 },
  { lat: 40.83, lng: -111.899 },
  { lat: 40.77, lng: -111.898 },
  { lat: 40.72, lng: -111.897 },
  { lat: 40.65, lng: -111.895 },
  { lat: 40.60, lng: -111.893 },
  { lat: 40.56, lng: -111.891 },
];

// I-80 — E-W through city (curves near Wasatch)
const I80 = [
  { lat: 40.772, lng: -112.09 },
  { lat: 40.769, lng: -111.98 },
  { lat: 40.764, lng: -111.94 },
  { lat: 40.761, lng: -111.90 },
  { lat: 40.758, lng: -111.86 },
  { lat: 40.753, lng: -111.82 },
  { lat: 40.747, lng: -111.76 },
  { lat: 40.742, lng: -111.70 },
];

// I-215 — partial beltway (south + west arc)
const I215 = [
  { lat: 40.770, lng: -111.935 }, // N — splits from I-15
  { lat: 40.735, lng: -111.924 },
  { lat: 40.704, lng: -111.928 },
  { lat: 40.678, lng: -111.942 },
  { lat: 40.658, lng: -111.963 },
  { lat: 40.652, lng: -111.993 },
  { lat: 40.658, lng: -112.022 },
  { lat: 40.678, lng: -112.042 },
  { lat: 40.712, lng: -112.052 },
  { lat: 40.754, lng: -112.042 },
  { lat: 40.772, lng: -112.020 }, // W — joins I-80
];

/* =============================================
   COORDINATE HELPERS
   ============================================= */
function latLngToXY(lat, lng, W, H) {
  const { minLat, maxLat, minLng, maxLng } = MAP_BOUNDS;
  const x = ((lng - minLng) / (maxLng - minLng)) * W;
  const y = ((maxLat - lat) / (maxLat - minLat)) * H;
  return { x, y };
}

// Assign a deterministic SLC demo position to each request by index
function getReqCoords(req) {
  const idx = Store.requests.findIndex(r => r.id === req.id);
  if (idx < 0) return null;
  return DEMO_PIN_POSITIONS[idx % DEMO_PIN_POSITIONS.length];
}

/* =============================================
   PIN COLORS  (by days until event)
   ============================================= */
function pinColor(eventDate) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const ev    = new Date(eventDate); ev.setHours(0, 0, 0, 0);
  const days  = Math.round((ev - today) / 86400000);
  if (days < 0)   return '#94a3b8'; // past
  if (days <= 7)  return '#ef4444'; // this week
  if (days <= 14) return '#f97316'; // 1–2 weeks
  if (days <= 30) return '#eab308'; // this month
  return '#22c55e';                  // 30+ days
}

function daysLabel(eventDate) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const ev    = new Date(eventDate); ev.setHours(0, 0, 0, 0);
  const days  = Math.round((ev - today) / 86400000);
  if (days < 0)   return `${Math.abs(days)}d ago`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `in ${days}d`;
}

/* =============================================
   DRAWING HELPERS
   ============================================= */
function fillPolygon(ctx, points, fill, stroke, strokeW, W, H) {
  ctx.beginPath();
  points.forEach(({ lat, lng }, i) => {
    const { x, y } = latLngToXY(lat, lng, W, H);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  if (fill)   { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = strokeW || 1; ctx.stroke(); }
}

function drawPolyline(ctx, points, color, lineW, W, H) {
  ctx.strokeStyle = color;
  ctx.lineWidth   = lineW;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  points.forEach(({ lat, lng }, i) => {
    const { x, y } = latLngToXY(lat, lng, W, H);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function drawInterstate(ctx, points, W, H) {
  drawPolyline(ctx, points, '#ffffff', 4.0, W, H); // white casing
  drawPolyline(ctx, points, '#f0cb34', 2.5, W, H); // yellow fill
}

/* =============================================
   PIN DRAWING
   ============================================= */
function drawPin(ctx, x, y, color, radius, selected) {
  ctx.save();
  ctx.shadowColor    = 'rgba(0,0,0,0.30)';
  ctx.shadowBlur     = 5;
  ctx.shadowOffsetY  = 2;

  if (selected) {
    ctx.beginPath();
    ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(37,99,235,0.18)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
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

/* =============================================
   LEGEND
   ============================================= */
const LEGEND_ITEMS = [
  { color: '#ef4444', label: 'This week'  },
  { color: '#f97316', label: '1–2 weeks'  },
  { color: '#eab308', label: 'This month' },
  { color: '#22c55e', label: '30+ days'   },
  { color: '#94a3b8', label: 'Past'       },
  { color: '#2563eb', label: 'Selected'   },
];

function drawLegend(ctx, W, H) {
  const pad = 7, dotR = 4.5, lineH = 15;
  const boxW = 90, boxH = LEGEND_ITEMS.length * lineH + pad * 2;
  const bx = W - boxW - 7, by = H - boxH - 7;

  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.roundRect(bx, by, boxW, boxH, 6);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.textBaseline = 'middle';
  LEGEND_ITEMS.forEach(({ color, label }, i) => {
    const cy = by + pad + i * lineH + lineH / 2;
    ctx.beginPath();
    ctx.arc(bx + pad + dotR, cy, dotR, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.font = '9.5px system-ui, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(label, bx + pad + dotR * 2 + 4, cy);
  });
}

/* =============================================
   COMPASS ROSE  (top-right)
   ============================================= */
function drawCompass(ctx, W) {
  const cx = W - 18, cy = 18, r = 10;
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 0.8; ctx.stroke();

  // N arrow
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx - 3.5, cy);
  ctx.lineTo(cx + 3.5, cy);
  ctx.closePath(); ctx.fill();
  // S arrow
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(cx, cy + r);
  ctx.lineTo(cx - 3.5, cy);
  ctx.lineTo(cx + 3.5, cy);
  ctx.closePath(); ctx.fill();
  // N label
  ctx.font = 'bold 7px system-ui, sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.textAlign  = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', cx, cy - r - 5);
  ctx.textAlign = 'left';
}

/* =============================================
   STREET GRID
   ============================================= */
function drawGrid(ctx, W, H) {
  const { minLat, maxLat, minLng, maxLng } = MAP_BOUNDS;

  // Minor streets
  ctx.strokeStyle = '#e8e0d4';
  ctx.lineWidth   = 0.35;
  for (let lat = Math.ceil(minLat / 0.009) * 0.009; lat <= maxLat; lat += 0.009) {
    const { y } = latLngToXY(lat, minLng, W, H);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  for (let lng = Math.ceil(minLng / 0.007) * 0.007; lng <= maxLng; lng += 0.007) {
    const { x } = latLngToXY(minLat, lng, W, H);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }

  // Major arterials
  ctx.strokeStyle = '#d4ccc0';
  ctx.lineWidth   = 0.75;
  for (let lat = Math.ceil(minLat / 0.027) * 0.027; lat <= maxLat; lat += 0.027) {
    const { y } = latLngToXY(lat, minLng, W, H);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  for (let lng = Math.ceil(minLng / 0.021) * 0.021; lng <= maxLng; lng += 0.021) {
    const { x } = latLngToXY(minLat, lng, W, H);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
}

/* =============================================
   CITY LABEL
   ============================================= */
function drawCityLabel(ctx, W, H) {
  const { x, y } = latLngToXY(40.762, -111.893, W, H);
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(30,41,59,0.55)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Salt Lake City', x + 2, y + 20);
  ctx.textAlign = 'left';
}

/* =============================================
   CORE DRAW — returns pin hit array
   ============================================= */
function drawMapBase(canvas, selectedReq) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // 1 — base land color
  ctx.fillStyle = '#f5f0e8';
  ctx.fillRect(0, 0, W, H);

  // 2 — Great Salt Lake
  fillPolygon(ctx, GREAT_SALT_LAKE, '#aedff7', '#7ec8e3', 1, W, H);

  // 3 — Wasatch Mountains
  fillPolygon(ctx, WASATCH, '#b8d4a0', '#8fb87a', 1, W, H);

  // 4 — Foothills
  fillPolygon(ctx, FOOTHILLS, '#cfe8b4', null, 0, W, H);

  // 5 — Street grid (drawn before roads so roads sit on top)
  drawGrid(ctx, W, H);

  // 6 — Airport (light gray)
  fillPolygon(ctx, AIRPORT, '#dde3ea', '#c4cdd8', 0.8, W, H);

  // 7 — Parks
  PARKS.forEach(pts => fillPolygon(ctx, pts, '#a8d8a8', '#80c080', 0.8, W, H));

  // 8 — Jordan River
  drawPolyline(ctx, JORDAN_RIVER, '#7ec8e3', 1.4, W, H);

  // 9 — Interstates (casings then fill)
  [I15, I80, I215].forEach(route => drawInterstate(ctx, route, W, H));

  // 10 — Subtle city label
  drawCityLabel(ctx, W, H);

  // 11 — Collect all pins
  const pins = Store.requests.map(req => {
    const coords = getReqCoords(req);
    if (!coords) return null;
    const { x, y } = latLngToXY(coords.lat, coords.lng, W, H);
    return { req, x, y };
  }).filter(Boolean);

  // 12 — Non-selected pins first
  pins.forEach(({ req, x, y }) => {
    if (req.id === selectedReq.id) return;
    drawPin(ctx, x, y, pinColor(req.eventDate), 7, false);
  });

  // 13 — Selected pin on top (blue, larger)
  const selCoords = getReqCoords(selectedReq);
  if (selCoords) {
    const { x, y } = latLngToXY(selCoords.lat, selCoords.lng, W, H);
    drawPin(ctx, x, y, '#2563eb', 10, true);
  }

  // 14 — Overlay elements
  drawLegend(ctx, W, H);
  drawCompass(ctx, W);

  // 15 — Canvas border
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth   = 1;
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

  return pins;
}

/* =============================================
   HOVER TOOLTIP
   ============================================= */
function drawTooltip(ctx, pin, selectedReq, W, H) {
  const { req, x, y } = pin;
  const isSelected = req.id === selectedReq.id;
  const hoverR = isSelected ? 13 : 11;

  drawPin(ctx, x, y, isSelected ? '#2563eb' : pinColor(req.eventDate), hoverR, isSelected);

  const lines = [
    { text: req.eventName,   bold: true,  color: '#f8fafc' },
    { text: req.city,        bold: false, color: '#94a3b8' },
    { text: `${formatDate(req.eventDate)} · ${daysLabel(req.eventDate)}`, bold: false, color: '#cbd5e1' },
  ];

  const tPad = 9, lineH = 16;
  ctx.font = 'bold 11px system-ui, sans-serif';

  // Clamp event name width at 180px
  const maxW = Math.min(
    Math.max(...lines.map(l => { ctx.font = (l.bold ? 'bold ' : '') + '11px system-ui, sans-serif'; return ctx.measureText(l.text).width; })),
    190
  );
  const tW = maxW + tPad * 2;
  const tH = lines.length * lineH + tPad * 2;

  let tx = x + 16;
  let ty = y - tH / 2;
  if (tx + tW > W - 4) tx = x - tW - 16;
  if (ty < 4)           ty = 4;
  if (ty + tH > H - 4)  ty = H - tH - 4;

  ctx.fillStyle = 'rgba(15,23,42,0.93)';
  ctx.roundRect(tx, ty, tW, tH, 7);
  ctx.fill();

  ctx.textBaseline = 'top';
  lines.forEach(({ text, bold, color }, i) => {
    ctx.font      = (bold ? 'bold ' : '') + '11px system-ui, sans-serif';
    ctx.fillStyle = color;
    // Clip long text
    let t = text;
    while (t.length > 3 && ctx.measureText(t).width > tW - tPad * 2) t = t.slice(0, -1);
    if (t !== text) t += '…';
    ctx.fillText(t, tx + tPad, ty + tPad + i * lineH);
  });
}

/* =============================================
   PUBLIC API
   ============================================= */
function initMinimap(canvas, selectedReq) {
  let pins    = drawMapBase(canvas, selectedReq);
  let hovered = null;

  function redraw(hoverPin) {
    pins = drawMapBase(canvas, selectedReq);
    if (hoverPin) {
      const ctx = canvas.getContext('2d');
      drawTooltip(ctx, hoverPin, selectedReq, canvas.width, canvas.height);
    }
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect  = canvas.getBoundingClientRect();
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
