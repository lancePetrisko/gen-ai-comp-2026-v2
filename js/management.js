/* =============================================
   Management Tab — Staff Directory & Assignment
   Staff filtering, profile drawer, smart matching
   ============================================= */

// Active filter state for the management tab
const MgmtState = { search: '', skill: '', status: '', minRating: '' };

// ==================== INIT ====================
function initManagement() {
  document.getElementById('mgmt-search').addEventListener('input', e => {
    MgmtState.search = e.target.value.toLowerCase();
    applyMgmtFilters();
  });
  ['mgmt-filter-skill', 'mgmt-filter-status', 'mgmt-filter-rating'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      MgmtState.skill      = document.getElementById('mgmt-filter-skill').value;
      MgmtState.status     = document.getElementById('mgmt-filter-status').value;
      MgmtState.minRating  = document.getElementById('mgmt-filter-rating').value;
      applyMgmtFilters();
    });
  });
  document.getElementById('mgmt-clear-filters').addEventListener('click', () => {
    MgmtState.search = MgmtState.skill = MgmtState.status = MgmtState.minRating = '';
    document.getElementById('mgmt-search').value = '';
    document.getElementById('mgmt-filter-skill').value  = '';
    document.getElementById('mgmt-filter-status').value = '';
    document.getElementById('mgmt-filter-rating').value = '';
    applyMgmtFilters();
  });
}

// ==================== RENDER ====================
function renderManagement() {
  renderMgmtSummary();
  applyMgmtFilters();
}

function renderMgmtSummary() {
  const avail   = STAFF.filter(s => s.status === 'Available').length;
  const working = STAFF.filter(s => s.status === 'Actively Working').length;
  const onBreak = STAFF.filter(s => s.status === 'On Break').length;
  document.getElementById('mgmt-stat-total').textContent   = STAFF.length;
  document.getElementById('mgmt-stat-avail').textContent   = avail;
  document.getElementById('mgmt-stat-working').textContent = working;
  document.getElementById('mgmt-stat-break').textContent   = onBreak;
}

// ==================== FILTERING ====================
function applyMgmtFilters() {
  let list = [...STAFF];
  if (MgmtState.search) {
    list = list.filter(s =>
      s.name.toLowerCase().includes(MgmtState.search) ||
      s.title.toLowerCase().includes(MgmtState.search) ||
      s.skills.some(sk => sk.includes(MgmtState.search))
    );
  }
  if (MgmtState.skill) {
    list = list.filter(s => s.skills.some(sk => sk.includes(MgmtState.skill)));
  }
  if (MgmtState.status) {
    list = list.filter(s => s.status === MgmtState.status);
  }
  if (MgmtState.minRating) {
    list = list.filter(s => s.overallRating >= parseFloat(MgmtState.minRating));
  }

  // Sort: Available first, then Actively Working, On Break, Unavailable
  const order = { 'Available': 0, 'Actively Working': 1, 'On Break': 2, 'Unavailable': 3 };
  list.sort((a, b) => (order[a.status] ?? 4) - (order[b.status] ?? 4) || b.overallRating - a.overallRating);

  renderStaffGrid(list);
}

// ==================== STAFF GRID ====================
function renderStaffGrid(list) {
  const grid = document.getElementById('mgmt-staff-grid');

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="mgmt-empty">
        <div class="mgmt-empty-icon">👥</div>
        <p>No staff members match your filters.</p>
        <button class="btn btn-ghost btn-sm" onclick="document.getElementById('mgmt-clear-filters').click()">Clear filters</button>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(s => staffCardHTML(s)).join('');

  grid.querySelectorAll('.staff-card').forEach(card => {
    // Click card body → open profile (but not the assign button)
    card.addEventListener('click', e => {
      if (e.target.closest('.btn-assign-staff')) return;
      openStaffProfile(card.dataset.staffId);
    });
  });
  grid.querySelectorAll('.btn-assign-staff').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openSmartMatch(null, btn.dataset.staffId);
    });
  });
}

function staffCardHTML(s) {
  const sc = statusConfig(s.status);
  return `
    <div class="staff-card" data-staff-id="${s.id}" title="Click to view full profile">
      <div class="staff-card-top">
        <div class="staff-avatar" style="background:${avatarColor(s.id)};">${s.avatar}</div>
        <div class="staff-card-info">
          <div class="staff-name">${escHtml(s.name)}</div>
          <div class="staff-title">${escHtml(s.title)}</div>
        </div>
        <div class="staff-status-pill ${sc.cls}">
          <span class="status-dot ${sc.dotCls}"></span>${escHtml(s.status)}
        </div>
      </div>

      <div class="skill-tags">
        ${s.skills.map(sk => `<span class="skill-tag">${escHtml(sk)}</span>`).join('')}
        ${s.languages.filter(l => l !== 'English').map(l => `<span class="lang-tag">${escHtml(l)}</span>`).join('')}
      </div>

      <div class="staff-stats-row">
        <div class="staff-stars-wrap">
          ${renderStarHTML(s.overallRating)}
          <span class="rating-num">${s.overallRating}</span>
        </div>
        <span class="staff-events-count">${s.eventsWorked} events</span>
      </div>

      <div class="staff-next-line">
        <span class="next-label">${s.status === 'Actively Working' ? 'Working:' : 'Available:'}</span>
        ${escHtml(s.status === 'Actively Working' ? s.currentAssignment : s.nextAvailable)}
      </div>

      <button class="btn btn-primary btn-sm btn-assign-staff" data-staff-id="${s.id}" style="width:100%;justify-content:center;">
        Assign to Event →
      </button>
    </div>`;
}

// ==================== STAR RENDERING ====================
function renderStarHTML(rating) {
  const full  = Math.floor(rating);
  const hasHalf = (rating % 1) >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  return (
    '<span class="stars">' +
    '<span class="star-filled">★</span>'.repeat(full) +
    (hasHalf ? '<span class="star-half">½</span>' : '') +
    '<span class="star-empty">☆</span>'.repeat(empty) +
    '</span>'
  );
}

// Small inline star bar for scenario ratings (1–5)
function renderScenarioStars(n) {
  let html = '<span class="scenario-stars">';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="${i <= n ? 'star-filled' : 'star-empty'}">${i <= n ? '★' : '☆'}</span>`;
  }
  return html + '</span>';
}

// ==================== HELPERS ====================
function statusConfig(status) {
  return {
    'Available':       { cls: 'pill-available',  dotCls: 'dot-available'  },
    'Actively Working':{ cls: 'pill-working',    dotCls: 'dot-working'    },
    'On Break':        { cls: 'pill-break',       dotCls: 'dot-break'      },
    'Unavailable':     { cls: 'pill-unavailable', dotCls: 'dot-unavailable'}
  }[status] || { cls: '', dotCls: '' };
}

// Deterministic accent color per staff member
function avatarColor(id) {
  const colors = [
    'linear-gradient(135deg,#2563eb,#7c3aed)',
    'linear-gradient(135deg,#16a34a,#0891b2)',
    'linear-gradient(135deg,#d97706,#dc2626)',
    'linear-gradient(135deg,#7c3aed,#db2777)',
    'linear-gradient(135deg,#0891b2,#2563eb)',
    'linear-gradient(135deg,#dc2626,#d97706)',
    'linear-gradient(135deg,#db2777,#7c3aed)',
    'linear-gradient(135deg,#65a30d,#16a34a)',
  ];
  const idx = parseInt(id.replace('STF-', '')) - 1;
  return colors[idx % colors.length];
}

// ==================== PROFILE DRAWER ====================
function openStaffProfile(staffId) {
  const s = STAFF.find(x => x.id === staffId);
  if (!s) return;

  let overlay = document.getElementById('staff-profile-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'staff-profile-overlay';
    overlay.className = 'staff-profile-overlay';
    overlay.innerHTML = `
      <div class="staff-profile-panel" role="dialog" aria-modal="true">
        <div class="spp-header" id="spp-header"></div>
        <div class="spp-body" id="spp-body"></div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeStaffProfile(); });
  }

  const sc = statusConfig(s.status);

  document.getElementById('spp-header').innerHTML = `
    <div class="spp-avatar" style="background:${avatarColor(s.id)};">${s.avatar}</div>
    <div class="spp-header-info">
      <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;">
        <h2 style="margin:0;font-size:1.2rem;">${escHtml(s.name)}</h2>
        <div class="staff-status-pill ${sc.cls}">
          <span class="status-dot ${sc.dotCls}"></span>${escHtml(s.status)}
        </div>
      </div>
      <div style="font-size:0.85rem;color:var(--c-text-secondary);margin:0.15rem 0 0.4rem;">${escHtml(s.title)}</div>
      <div style="display:flex;gap:0.75rem;font-size:0.82rem;color:var(--c-text-secondary);flex-wrap:wrap;">
        <span>📧 ${escHtml(s.email)}</span>
        <span>📞 ${escHtml(s.phone)}</span>
        <span>🌐 ${s.languages.join(', ')}</span>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.4rem;align-items:flex-end;flex-shrink:0;">
      <button class="btn btn-primary btn-sm" onclick="closeStaffProfile();openSmartMatch(null,'${s.id}');">Assign to Event →</button>
      <button class="btn btn-ghost btn-sm" onclick="closeStaffProfile()">Close</button>
    </div>`;

  document.getElementById('spp-body').innerHTML = `
    <!-- Stats strip -->
    <div class="spp-stats-strip">
      <div class="spp-stat">
        <div class="spp-stat-val">${renderStarHTML(s.overallRating)} ${s.overallRating}</div>
        <div class="spp-stat-label">Overall Rating</div>
      </div>
      <div class="spp-stat">
        <div class="spp-stat-val" style="font-size:1.4rem;font-weight:700;">${s.eventsWorked}</div>
        <div class="spp-stat-label">Events Worked</div>
      </div>
      <div class="spp-stat">
        <div class="spp-stat-val" style="font-size:0.9rem;font-weight:600;">${s.status === 'Actively Working' ? escHtml(s.currentAssignment) : escHtml(s.nextAvailable)}</div>
        <div class="spp-stat-label">${s.status === 'Actively Working' ? 'Current Assignment' : 'Next Available'}</div>
      </div>
    </div>

    <!-- Skills -->
    <div class="spp-section">
      <div class="spp-section-title">Skills & Specializations</div>
      <div class="skill-tags">
        ${s.skills.map(sk => `<span class="skill-tag">${escHtml(sk)}</span>`).join('')}
        ${s.languages.filter(l => l !== 'English').map(l => `<span class="lang-tag">${escHtml(l)}</span>`).join('')}
      </div>
    </div>

    <!-- Scenario Ratings -->
    <div class="spp-section">
      <div class="spp-section-title">Scenario Ratings</div>
      <div class="scenario-grid">
        ${Object.entries(s.scenarioRatings).map(([key, val]) => `
          <div class="scenario-row">
            <div class="scenario-header-row">
              <span class="scenario-label">${SCENARIO_LABELS[key]}</span>
              <span class="scenario-score">${val}/5</span>
            </div>
            <div class="scenario-bar-bg">
              <div class="scenario-bar-fill" style="width:${val * 20}%;background:${scenarioBarColor(val)};"></div>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <!-- Event History -->
    <div class="spp-section">
      <div class="spp-section-title">Event History</div>
      <div class="history-list">
        ${s.eventHistory.map(h => `
          <div class="history-item">
            <div class="history-item-top">
              <span class="history-event-name">${escHtml(h.eventName)}</span>
              <span class="history-date">${formatDate(h.date)}</span>
            </div>
            <div class="history-role">${escHtml(h.role)}</div>
            <div class="history-notes">"${escHtml(h.notes)}"</div>
          </div>`).join('')}
      </div>
    </div>

    <!-- Staff Notes -->
    ${s.notes ? `
    <div class="spp-section">
      <div class="spp-section-title">Staff Notes</div>
      <div class="spp-notes">${escHtml(s.notes)}</div>
    </div>` : ''}
  `;

  overlay.classList.add('visible');
}

function closeStaffProfile() {
  const el = document.getElementById('staff-profile-overlay');
  if (el) el.classList.remove('visible');
}

function scenarioBarColor(val) {
  if (val >= 4) return 'var(--c-success)';
  if (val >= 3) return 'var(--c-warning)';
  return 'var(--c-danger)';
}

// ==================== SMART MATCH ====================
/*
  Scoring logic (max ~100 pts):
  - Availability:     Available = 35, On Break = 10, others = 0
  - Skill match:      +20 per skill that aligns with event category
  - Scenario rating:  +5×rating if the relevant scenario ≥ 4
  - Overall rating:   +4×overallRating
  - Experience:       +10 if eventsWorked ≥ 30, +5 if ≥ 15
*/
function computeMatches(event) {
  // Map event category to required staff skills
  const skillMap = {
    'School Event':       ['school events', 'childcare'],
    'Health Education':   ['community outreach', 'school events'],
    'Community Outreach': ['community outreach'],
    'Internal Program':   ['community outreach'],
    'Fundraising':        ['community outreach'],
    'Partner Request':    ['community outreach'],
    'Special Event':      ['community outreach'],
  };
  // Map event category to a primary scenario rating key
  const scenarioMap = {
    'School Event':       'schoolEvents',
    'Health Education':   'outreach',
    'Community Outreach': 'outreach',
    'Internal Program':   'outreach',
    'Fundraising':        'outreach',
    'Partner Request':    'outreach',
    'Special Event':      'outreach',
  };

  const cat           = event ? (event.adminCategory || event.aiCategory || '') : '';
  const reqSkills     = skillMap[cat]    || ['community outreach'];
  const reqScenario   = scenarioMap[cat] || 'outreach';

  return STAFF.map(staff => {
    let score = 0;
    const reasons = [];

    // 1. Availability
    if (staff.status === 'Available') {
      score += 35;
      reasons.push('currently available');
    } else if (staff.status === 'On Break') {
      score += 10;
      reasons.push(`available ${staff.nextAvailable}`);
    }
    // Actively Working / Unavailable contribute 0

    // 2. Skill match
    const matched = staff.skills.filter(sk =>
      reqSkills.some(rs => sk.toLowerCase().includes(rs) || rs.includes(sk.toLowerCase()))
    );
    score += matched.length * 20;
    if (matched.length) reasons.push(`${matched.join(' & ')} experience`);

    // 3. Scenario rating
    const scenRating = staff.scenarioRatings[reqScenario] || 0;
    if (scenRating >= 4) {
      score += scenRating * 5;
      reasons.push(`${SCENARIO_LABELS[reqScenario]} rating ${scenRating}/5`);
    }

    // 4. Overall rating
    score += staff.overallRating * 4;

    // 5. Experience bonus
    if (staff.eventsWorked >= 30) { score += 10; reasons.push('highly experienced'); }
    else if (staff.eventsWorked >= 15) { score += 5; }

    return { staff, score, reasons };
  })
  .sort((a, b) => b.score - a.score)
  .slice(0, 3);
}

function openSmartMatch(event, highlightStaffId) {
  let overlay = document.getElementById('smart-match-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'smart-match-overlay';
    overlay.className = 'smart-match-overlay';
    overlay.innerHTML = `
      <div class="smart-match-panel" role="dialog" aria-modal="true">
        <div class="sm-header">
          <div>
            <h3 style="margin:0;font-size:1rem;">Smart Staff Match</h3>
            <p style="margin:0.15rem 0 0;font-size:0.8rem;color:var(--c-text-secondary);">
              Select an event to see the best-matched staff members.
            </p>
          </div>
          <button class="btn-close" onclick="closeSmartMatch()" aria-label="Close">&times;</button>
        </div>
        <div class="sm-body">
          <div class="sm-event-select-row">
            <label for="sm-event-picker" style="font-size:0.82rem;font-weight:600;color:var(--c-text-secondary);">Select Event</label>
            <select id="sm-event-picker" class="form-select" style="width:100%;margin-top:0.35rem;"></select>
          </div>
          <div id="sm-event-summary"></div>
          <div id="sm-match-results"></div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeSmartMatch(); });
  }

  // Populate event picker from Store.requests (non-Fulfilled)
  const picker = document.getElementById('sm-event-picker');
  const open   = Store.requests.filter(r => r.status !== 'Fulfilled');
  picker.innerHTML = '<option value="">— Choose a request —</option>' +
    open.map(r => `<option value="${r.id}">${escHtml(r.id)} · ${escHtml(r.eventName)}</option>`).join('');

  // If an event was pre-selected, pick it
  if (event) picker.value = event.id;

  // Wire picker change
  picker.onchange = () => {
    const req = Store.requests.find(r => r.id === picker.value);
    renderSmartMatchResults(req, highlightStaffId);
  };

  // Render initial results
  const preEvent = event || (open.length ? open[0] : null);
  if (preEvent) {
    picker.value = preEvent.id;
    renderSmartMatchResults(preEvent, highlightStaffId);
  } else {
    document.getElementById('sm-event-summary').innerHTML  = '';
    document.getElementById('sm-match-results').innerHTML  =
      '<p style="color:var(--c-text-secondary);font-size:0.85rem;padding:1rem 0;">No open requests found.</p>';
  }

  overlay.classList.add('visible');
}

function renderSmartMatchResults(event, highlightStaffId) {
  if (!event) {
    document.getElementById('sm-event-summary').innerHTML = '';
    document.getElementById('sm-match-results').innerHTML = '';
    return;
  }

  const cat = event.adminCategory || event.aiCategory || '—';
  const pri = event.adminPriority || event.aiPriority  || '—';

  // Event summary card
  document.getElementById('sm-event-summary').innerHTML = `
    <div class="sm-event-box">
      <div class="sm-event-name">${escHtml(event.eventName)}</div>
      <div class="sm-event-meta">
        <span>${statusBadge(event.status)}</span>
        <span>${priorityBadge(pri)}</span>
        <span>📅 ${formatDate(event.eventDate)}</span>
        <span>📍 ${escHtml(event.city)}</span>
        <span>🏷️ ${escHtml(cat)}</span>
        <span>👥 Est. ${escHtml(event.estimatedAttendance)}</span>
      </div>
    </div>`;

  const matches = computeMatches(event);

  if (matches.length === 0) {
    document.getElementById('sm-match-results').innerHTML =
      '<p style="color:var(--c-text-secondary);font-size:0.85rem;padding:0.5rem 0;">No staff available for this event.</p>';
    return;
  }

  const resultsHTML = `
    <div class="sm-results-title">Top Matches</div>
    <div class="sm-match-list">
      ${matches.map(({ staff, score, reasons }, idx) => {
        const sc = statusConfig(staff.status);
        const isHighlighted = staff.id === highlightStaffId;
        const rankLabel = ['#1 Best Match', '#2', '#3'][idx];
        return `
          <div class="sm-match-card ${isHighlighted ? 'sm-highlighted' : ''} ${idx === 0 ? 'sm-top-match' : ''}">
            <div class="sm-rank-badge" style="${idx === 0 ? 'background:#2563eb;color:#fff;' : ''}">${rankLabel}</div>
            <div class="sm-match-main">
              <div class="sm-match-top">
                <div class="staff-avatar sm-avatar" style="background:${avatarColor(staff.id)};">${staff.avatar}</div>
                <div style="flex:1;min-width:0;">
                  <div style="font-weight:700;font-size:0.92rem;">${escHtml(staff.name)}</div>
                  <div style="font-size:0.78rem;color:var(--c-text-secondary);">${escHtml(staff.title)}</div>
                </div>
                <div class="staff-status-pill ${sc.cls}" style="flex-shrink:0;">
                  <span class="status-dot ${sc.dotCls}"></span>${escHtml(staff.status)}
                </div>
              </div>
              <div class="sm-reason">
                ✦ Best match because: <strong>${reasons.join(', ')}</strong>
              </div>
              <div class="sm-match-footer">
                <span>${renderStarHTML(staff.overallRating)} ${staff.overallRating}</span>
                <span style="color:var(--c-text-secondary);font-size:0.78rem;">${staff.eventsWorked} events worked</span>
                <button class="btn btn-success btn-sm sm-assign-btn"
                  data-staff-id="${staff.id}" data-event-id="${event.id}">
                  ✓ Assign
                </button>
              </div>
            </div>
          </div>`;
      }).join('')}
    </div>`;

  const resultsEl = document.getElementById('sm-match-results');
  resultsEl.innerHTML = resultsHTML;

  // Wire assign buttons
  resultsEl.querySelectorAll('.sm-assign-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      assignStaffToEvent(btn.dataset.staffId, btn.dataset.eventId);
    });
  });
}

function assignStaffToEvent(staffId, eventId) {
  const staff = STAFF.find(s => s.id === staffId);
  const event = Store.requests.find(r => r.id === eventId);
  if (!staff || !event) return;

  // Update staff status
  staff.status            = 'Actively Working';
  staff.currentAssignment = event.eventName;
  staff.nextAvailable     = formatDate(event.eventDate);

  // Update event status to Approved if it was Submitted/In Review
  if (event.status === 'Submitted' || event.status === 'In Review') {
    event.status = 'Approved';
    Store.save();
  }

  closeSmartMatch();
  showToast(`${staff.name} assigned to "${event.eventName}"`);

  // Refresh the management tab grid and summary
  renderManagement();
}

function closeSmartMatch() {
  const el = document.getElementById('smart-match-overlay');
  if (el) el.classList.remove('visible');
}
