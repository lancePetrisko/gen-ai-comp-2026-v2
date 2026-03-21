/* =============================================
   Admin Dashboard Page Logic
   Queue, filters, detail panel, planning,
   reporting, assets
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  Store.load();
  seedDemoDataIfNeeded();
  initFilters();
  initSearch();
  initSort();
  initTabs();
  initSummaryCardClicks();
  initManagement();
  refreshDashboard();
});

/** Seed demo data into Store if it hasn't been seeded yet */
function seedDemoDataIfNeeded() {
  if (Store.requests.length > 0) return;
  DEMO_REQUESTS.forEach(data => {
    const req = processNewRequest({ ...data });
    req.status = data.status;
    Store.requests.push(req);
  });
  Store.save();
}

// ==================== REFRESH ====================
function refreshDashboard() {
  updateSummaryCounts();
  renderQueue();
  renderPlanning();
  renderReporting();
  renderAssets();
  renderManagement();
}

// ==================== SUMMARY COUNTS ====================
function updateSummaryCounts() {
  const r = Store.requests;
  document.getElementById('count-total').textContent = r.length;
  document.getElementById('count-new').textContent = r.filter(x => x.status === 'Submitted').length;
  document.getElementById('count-review').textContent = r.filter(x => x.status === 'In Review').length;
  document.getElementById('count-approved').textContent = r.filter(x => x.status === 'Approved').length;
  document.getElementById('count-fulfilled').textContent = r.filter(x => x.status === 'Fulfilled').length;

  const now = new Date();
  const in30 = new Date(now);
  in30.setDate(in30.getDate() + 30);
  document.getElementById('count-upcoming').textContent = r.filter(x => {
    const d = new Date(x.eventDate);
    return d >= now && d <= in30;
  }).length;
}

// ==================== SUMMARY CARD CLICKS ====================
function initSummaryCardClicks() {
  document.querySelectorAll('.summary-card[data-filter-status]').forEach(card => {
    card.addEventListener('click', () => {
      const status = card.dataset.filterStatus;
      if (status === 'all') {
        document.getElementById('filter-status').value = '';
      } else {
        document.getElementById('filter-status').value = status;
      }
      applyFilters();
      switchTab('queue');
    });
  });
}

// ==================== FILTERS ====================
function initFilters() {
  ['filter-status','filter-type','filter-fulfillment','filter-category','filter-priority','filter-area'].forEach(id => {
    document.getElementById(id).addEventListener('change', applyFilters);
  });
  document.getElementById('btn-clear-filters').addEventListener('click', () => {
    ['filter-status','filter-type','filter-fulfillment','filter-category','filter-priority','filter-area'].forEach(id => {
      document.getElementById(id).value = '';
    });
    applyFilters();
  });
}

function applyFilters() {
  Store.filters = {
    status: document.getElementById('filter-status').value,
    type: document.getElementById('filter-type').value,
    fulfillment: document.getElementById('filter-fulfillment').value,
    category: document.getElementById('filter-category').value,
    priority: document.getElementById('filter-priority').value,
    area: document.getElementById('filter-area').value
  };
  renderQueue();
}

// ==================== SEARCH ====================
function initSearch() {
  document.getElementById('dash-search').addEventListener('input', (e) => {
    Store.searchQuery = e.target.value.toLowerCase();
    renderQueue();
  });
}

// ==================== SORT ====================
function initSort() {
  document.querySelectorAll('.queue-table th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      if (Store.sortField === field) {
        Store.sortDir = Store.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        Store.sortField = field;
        Store.sortDir = 'asc';
      }
      renderQueue();
    });
  });
}

// ==================== TABS ====================
function initTabs() {
  document.querySelectorAll('.dash-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
}

function switchTab(tabName) {
  document.querySelectorAll('.dash-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabName);
    t.setAttribute('aria-selected', t.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-panel').forEach(p => {
    const isActive = p.id === 'tab-' + tabName;
    p.classList.toggle('active', isActive);
    p.hidden = !isActive;
  });
}

// ==================== QUEUE ====================
function getFilteredRequests() {
  let reqs = [...Store.requests];

  if (Store.searchQuery) {
    const q = Store.searchQuery;
    reqs = reqs.filter(r =>
      r.id.toLowerCase().includes(q) ||
      r.eventName.toLowerCase().includes(q) ||
      r.organization.toLowerCase().includes(q) ||
      r.requestorName.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q)
    );
  }

  const f = Store.filters;
  if (f.status) reqs = reqs.filter(r => r.status === f.status);
  if (f.type) reqs = reqs.filter(r => r.requestType === f.type);
  if (f.fulfillment) reqs = reqs.filter(r => r.preferredFulfillment === f.fulfillment);
  if (f.category) reqs = reqs.filter(r => (r.adminCategory || r.aiCategory) === f.category);
  if (f.priority) reqs = reqs.filter(r => (r.adminPriority || r.aiPriority) === f.priority);
  if (f.area) reqs = reqs.filter(r => r.serviceArea === f.area);

  reqs.sort((a, b) => {
    let va = a[Store.sortField] || '';
    let vb = b[Store.sortField] || '';
    if (Store.sortField === 'aiCategory') { va = a.adminCategory || a.aiCategory; vb = b.adminCategory || b.aiCategory; }
    if (Store.sortField === 'aiPriority') { va = a.adminPriority || a.aiPriority; vb = b.adminPriority || b.aiPriority; }
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return Store.sortDir === 'asc' ? -1 : 1;
    if (va > vb) return Store.sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return reqs;
}

function renderQueue() {
  const tbody = document.getElementById('queue-tbody');
  const empty = document.getElementById('queue-empty');
  const reqs = getFilteredRequests();

  document.querySelectorAll('.queue-table th.sortable').forEach(th => {
    const existing = th.querySelector('.sort-arrow');
    if (existing) existing.remove();
    if (th.dataset.sort === Store.sortField) {
      const arrow = document.createElement('span');
      arrow.className = 'sort-arrow';
      arrow.textContent = Store.sortDir === 'asc' ? ' ▲' : ' ▼';
      th.appendChild(arrow);
    }
  });

  if (reqs.length === 0) {
    tbody.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  tbody.innerHTML = reqs.map(r => {
    const cat = r.adminCategory || r.aiCategory;
    const pri = r.adminPriority || r.aiPriority;
    return `<tr data-id="${r.id}" class="${Store.selectedId === r.id ? 'selected' : ''}" tabindex="0">
      <td><strong>${r.id}</strong></td>
      <td>${escHtml(r.eventName)}</td>
      <td>${escHtml(r.organization)}</td>
      <td>${formatDate(r.eventDate)}</td>
      <td>${statusBadge(r.status)}</td>
      <td>${escHtml(cat)}</td>
      <td>${priorityBadge(pri)}</td>
      <td>${areaBadge(r.serviceArea)}</td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('tr').forEach(tr => {
    tr.addEventListener('click', () => selectRequest(tr.dataset.id));
    tr.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectRequest(tr.dataset.id); }
    });
  });
}

function selectRequest(id) {
  Store.selectedId = id;
  const req = Store.requests.find(r => r.id === id);
  if (!req) return;

  document.querySelectorAll('.queue-table tbody tr').forEach(tr => {
    tr.classList.toggle('selected', tr.dataset.id === id);
  });

  const panel = document.getElementById('detail-panel');
  const layout = document.querySelector('.queue-layout');
  panel.hidden = false;
  layout.classList.add('has-detail');

  renderDetailPanel(req);

  document.getElementById('btn-close-detail').onclick = () => {
    panel.hidden = true;
    layout.classList.remove('has-detail');
    Store.selectedId = null;
    document.querySelectorAll('.queue-table tbody tr').forEach(tr => tr.classList.remove('selected'));
  };
}

// ==================== DETAIL PANEL ====================
function renderDetailPanel(req) {
  const body = document.getElementById('detail-body');
  const cat = req.adminCategory || req.aiCategory;
  const pri = req.adminPriority || req.aiPriority;
  const ful = req.adminFulfillment || req.aiFulfillment;

  body.innerHTML = `
    <!-- AI Suggestions -->
    <div class="ai-suggestion-box">
      <div class="ai-tag">
        <svg viewBox="0 0 20 20"><path d="M10 2a1 1 0 0 1 1 1v1.07A7 7 0 0 1 16.93 10H18a1 1 0 1 1 0 2h-1.07A7 7 0 0 1 11 17.93V19a1 1 0 1 1-2 0v-1.07A7 7 0 0 1 3.07 12H2a1 1 0 1 1 0-2h1.07A7 7 0 0 1 9 4.07V3a1 1 0 0 1 1-1zm0 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" fill="currentColor"/></svg>
        AI-Powered Insights
      </div>
      <div class="ai-row"><span class="ai-label">Suggested Category</span><span class="ai-value">${escHtml(req.aiCategory)}</span></div>
      <div class="ai-row"><span class="ai-label">Suggested Priority</span><span class="ai-value">${priorityBadge(req.aiPriority)}</span></div>
      <div class="ai-row"><span class="ai-label">Recommended Route</span><span class="ai-value">${escHtml(req.aiFulfillment)}</span></div>
      <div class="ai-row"><span class="ai-label">Suggested Staffing</span><span class="ai-value">${escHtml(req.aiStaffing)}</span></div>
      <div class="ai-row"><span class="ai-label">Service Area</span><span class="ai-value">${areaBadge(req.serviceArea)}</span></div>
      ${req.aiInsights.length ? `<div style="margin-top:0.5rem;font-size:0.8rem;"><strong>NLP Insights:</strong><ul style="margin:0.3rem 0 0 1.2rem;padding:0;">${req.aiInsights.map(i => `<li>${escHtml(i)}</li>`).join('')}</ul></div>` : ''}
      ${req.aiTags.length ? `<div style="margin-top:0.4rem;font-size:0.78rem;">${req.aiTags.map(t => `<span class="badge badge-submitted" style="margin-right:0.3rem;">${escHtml(t)}</span>`).join('')}</div>` : ''}
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Requestor</div>
      <div class="detail-row"><span class="detail-label">Name</span><span class="detail-value">${escHtml(req.requestorName)}</span></div>
      <div class="detail-row"><span class="detail-label">Organization</span><span class="detail-value">${escHtml(req.organization)}</span></div>
      <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${escHtml(req.email)}</span></div>
      <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${escHtml(req.phone || '—')}</span></div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Event</div>
      <div class="detail-row"><span class="detail-label">Event</span><span class="detail-value">${escHtml(req.eventName)}</span></div>
      <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${formatDate(req.eventDate)}</span></div>
      <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${formatTime(req.startTime)} – ${formatTime(req.endTime)}</span></div>
      <div class="detail-row"><span class="detail-label">Location</span><span class="detail-value">${escHtml(req.eventLocation)}</span></div>
      <div class="detail-row"><span class="detail-label">City / ZIP</span><span class="detail-value">${escHtml(req.city)}, ${escHtml(req.zipCode)}</span></div>
      <div class="detail-row"><span class="detail-label">Audience</span><span class="detail-value">${escHtml(req.audienceType)}</span></div>
      <div class="detail-row"><span class="detail-label">Attendance</span><span class="detail-value">${escHtml(req.estimatedAttendance)}</span></div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Request</div>
      <div class="detail-row"><span class="detail-label">Type</span><span class="detail-value">${escHtml(req.requestType)}</span></div>
      <div class="detail-row"><span class="detail-label">Fulfillment</span><span class="detail-value">${escHtml(req.preferredFulfillment)}</span></div>
      <div class="detail-row"><span class="detail-label">Materials</span><span class="detail-value">${req.materials && req.materials.length ? req.materials.join(', ') : '—'}</span></div>
      <div class="detail-row"><span class="detail-label">Staff Support</span><span class="detail-value">${escHtml(req.staffSupport || 'Not specified')}</span></div>
      ${req.additionalNotes ? `<div class="detail-row"><span class="detail-label">Notes</span><span class="detail-value">${escHtml(req.additionalNotes)}</span></div>` : ''}
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Description</div>
      <p style="font-size:0.85rem;line-height:1.5;color:var(--c-text-secondary);">${escHtml(req.eventDescription)}</p>
    </div>

    <!-- Admin Controls -->
    <div class="detail-section">
      <div class="detail-section-title">Admin Controls</div>
      <div class="admin-controls">
        <div class="admin-field">
          <label for="admin-status">Status</label>
          <select id="admin-status">
            <option ${req.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
            <option ${req.status === 'In Review' ? 'selected' : ''}>In Review</option>
            <option ${req.status === 'Approved' ? 'selected' : ''}>Approved</option>
            <option ${req.status === 'Sent to Qualtrics' ? 'selected' : ''}>Sent to Qualtrics</option>
            <option ${req.status === 'Fulfilled' ? 'selected' : ''}>Fulfilled</option>
          </select>
        </div>
        <div class="admin-field">
          <label for="admin-category">Category (override AI suggestion)</label>
          <select id="admin-category">
            <option value="">Use AI suggestion: ${escHtml(req.aiCategory)}</option>
            <option ${(req.adminCategory) === 'Community Outreach' ? 'selected' : ''}>Community Outreach</option>
            <option ${(req.adminCategory) === 'Internal Program' ? 'selected' : ''}>Internal Program</option>
            <option ${(req.adminCategory) === 'School Event' ? 'selected' : ''}>School Event</option>
            <option ${(req.adminCategory) === 'Health Education' ? 'selected' : ''}>Health Education</option>
            <option ${(req.adminCategory) === 'Fundraising' ? 'selected' : ''}>Fundraising</option>
            <option ${(req.adminCategory) === 'Partner Request' ? 'selected' : ''}>Partner Request</option>
            <option ${(req.adminCategory) === 'Special Event' ? 'selected' : ''}>Special Event</option>
          </select>
        </div>
        <div class="admin-field">
          <label for="admin-priority">Priority (override AI suggestion)</label>
          <select id="admin-priority">
            <option value="">Use AI suggestion: ${escHtml(req.aiPriority)}</option>
            <option ${(req.adminPriority) === 'Low' ? 'selected' : ''}>Low</option>
            <option ${(req.adminPriority) === 'Medium' ? 'selected' : ''}>Medium</option>
            <option ${(req.adminPriority) === 'High' ? 'selected' : ''}>High</option>
            <option ${(req.adminPriority) === 'Urgent' ? 'selected' : ''}>Urgent</option>
          </select>
        </div>
        <div class="admin-field">
          <label for="admin-fulfillment">Fulfillment Path (override AI suggestion)</label>
          <select id="admin-fulfillment">
            <option value="">Use AI suggestion: ${escHtml(req.aiFulfillment)}</option>
            <option ${(req.adminFulfillment) === 'Staff Deployment' ? 'selected' : ''}>Staff Deployment</option>
            <option ${(req.adminFulfillment) === 'Mail Fulfillment' ? 'selected' : ''}>Mail Fulfillment</option>
            <option ${(req.adminFulfillment) === 'Pickup Preparation' ? 'selected' : ''}>Pickup Preparation</option>
          </select>
        </div>
        <div class="admin-field">
          <label for="admin-notes">Admin Notes</label>
          <textarea id="admin-notes" rows="2" placeholder="Internal notes…">${escHtml(req.adminNotes)}</textarea>
        </div>
        <div class="admin-actions">
          <button class="btn btn-primary btn-sm" id="btn-save-admin">Save Changes</button>
          ${req.status === 'Approved' ? `<button class="btn btn-success btn-sm" id="btn-create-invite">Create Event Invite</button>` : ''}
          <button class="btn btn-warning btn-sm" id="btn-qualtrics">Send to Qualtrics</button>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Standardized Record</div>
      <div class="detail-row"><span class="detail-label">Request ID</span><span class="detail-value">${req.id}</span></div>
      <div class="detail-row"><span class="detail-label">Submitted</span><span class="detail-value">${new Date(req.submittedAt).toLocaleDateString()}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${statusBadge(req.status)}</span></div>
      <div class="detail-row"><span class="detail-label">Category</span><span class="detail-value">${escHtml(cat)}</span></div>
      <div class="detail-row"><span class="detail-label">Priority</span><span class="detail-value">${priorityBadge(pri)}</span></div>
      <div class="detail-row"><span class="detail-label">Fulfillment</span><span class="detail-value">${escHtml(ful)}</span></div>
    </div>
  `;

  // Admin save
  document.getElementById('btn-save-admin').addEventListener('click', () => {
    req.status = document.getElementById('admin-status').value;
    req.adminCategory = document.getElementById('admin-category').value || null;
    req.adminPriority = document.getElementById('admin-priority').value || null;
    req.adminFulfillment = document.getElementById('admin-fulfillment').value || null;
    req.adminNotes = document.getElementById('admin-notes').value;
    Store.save();
    showToast('Changes saved successfully');
    refreshDashboard();
    renderDetailPanel(req);
  });

  const inviteBtn = document.getElementById('btn-create-invite');
  if (inviteBtn) {
    inviteBtn.addEventListener('click', () => openInviteModal(req));
  }

  document.getElementById('btn-qualtrics').addEventListener('click', () => {
    req.status = 'Sent to Qualtrics';
    Store.save();
    showToast('Request sent to Qualtrics');
    refreshDashboard();
    renderDetailPanel(req);
  });
}

// ==================== PLANNING ====================
function renderPlanning() {
  const now = new Date();
  const upcoming = Store.requests
    .filter(r => new Date(r.eventDate) >= now && r.status !== 'Fulfilled')
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

  const timeline = document.getElementById('planning-timeline');
  if (upcoming.length === 0) {
    timeline.innerHTML = '<p style="color:var(--c-text-secondary);font-size:0.9rem;">No upcoming events.</p>';
  } else {
    timeline.innerHTML = upcoming.map(r => `
      <div class="timeline-item">
        <div class="timeline-date">${formatDate(r.eventDate)}</div>
        <div class="timeline-info">
          <strong>${escHtml(r.eventName)}</strong>
          <span>${escHtml(r.organization)} · ${escHtml(r.city)} · ${statusBadge(r.status)} ${priorityBadge(r.adminPriority || r.aiPriority)}</span>
        </div>
      </div>
    `).join('');

    timeline.querySelectorAll('.timeline-item').forEach((item, i) => {
      const req = upcoming[i];
      item.addEventListener('mousemove', e => showTimelineTooltip(req, e));
      item.addEventListener('mouseleave', hideTimelineTooltip);
      item.addEventListener('click', () => { hideTimelineTooltip(); openTimelineDetail(req); });
    });
  }

  const staffing = document.getElementById('planning-staffing');
  const staffEvents = upcoming.filter(r =>
    r.requestType === 'Staffed Event Support' || r.requestType === 'Staffing + Materials'
  );
  if (staffEvents.length === 0) {
    staffing.innerHTML = '<p style="color:var(--c-text-secondary);font-size:0.9rem;">No staffing events in queue.</p>';
  } else {
    staffing.innerHTML = staffEvents.map(r => {
      const level = r.staffSupport || 'TBD';
      const pct = level === '5+ Staff' ? 100 : level === '3-5 Staff' ? 70 : level === '1-2 Staff' ? 35 : 10;
      const color = pct > 70 ? 'var(--c-danger)' : pct > 40 ? 'var(--c-warning)' : 'var(--c-success)';
      return `<div class="staffing-item">
        <span>${escHtml(r.eventName)} <small style="color:var(--c-text-secondary);">(${formatDate(r.eventDate)})</small></span>
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <span style="font-size:0.8rem;font-weight:600;">${escHtml(level)}</span>
          <div class="staffing-bar"><div class="staffing-bar-fill" style="width:${pct}%;background:${color};"></div></div>
        </div>
      </div>`;
    }).join('');
  }

  const mailQueue = document.getElementById('planning-mail');
  const mailEvents = Store.requests.filter(r =>
    (r.adminFulfillment || r.aiFulfillment) === 'Mail Fulfillment' && r.status !== 'Fulfilled'
  );
  if (mailEvents.length === 0) {
    mailQueue.innerHTML = '<p style="color:var(--c-text-secondary);font-size:0.9rem;">No mail fulfillment items in queue.</p>';
  } else {
    mailQueue.innerHTML = mailEvents.map(r => `
      <div class="mail-item">
        <span>${escHtml(r.eventName)} — ${escHtml(r.organization)}</span>
        <div>${statusBadge(r.status)} ${areaBadge(r.serviceArea)}</div>
      </div>
    `).join('');
  }
}

// ==================== REPORTING ====================
function renderReporting() {
  const groupByKey = (fn) => {
    const map = {};
    Store.requests.forEach(r => {
      const key = fn(r);
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  const statusMap      = groupByKey(r => r.status);
  const categoryMap    = groupByKey(r => r.adminCategory || r.aiCategory);
  const fulfillmentMap = groupByKey(r => r.adminFulfillment || r.aiFulfillment);
  const areaMap        = groupByKey(r => r.serviceArea);

  drawDonut('chart-status',      'legend-status',      countBy(Store.requests, r => r.status),                           statusMap);
  drawDonut('chart-category',    'legend-category',    countBy(Store.requests, r => r.adminCategory || r.aiCategory),    categoryMap);
  drawDonut('chart-fulfillment', 'legend-fulfillment', countBy(Store.requests, r => r.adminFulfillment || r.aiFulfillment), fulfillmentMap);
  drawDonut('chart-area',        'legend-area',        countBy(Store.requests, r => r.serviceArea),                      areaMap);
  drawBarChart();
}

// ==================== ASSETS ====================
function renderAssets() {
  const grid = document.getElementById('assets-grid');
  grid.innerHTML = ASSETS.map(cat => `
    <div class="asset-card">
      <h4><span class="asset-icon" style="background:${cat.color};">${cat.icon}</span> ${escHtml(cat.category)}</h4>
      <ul class="asset-list">
        ${cat.items.map(item => `<li><span>${escHtml(item.name)}</span><span class="asset-qty">${item.qty} available</span></li>`).join('')}
      </ul>
    </div>
  `).join('');
}

// ==================== TIMELINE TOOLTIP ====================
function showTimelineTooltip(req, e) {
  let el = document.getElementById('chart-hover-tooltip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'chart-hover-tooltip';
    el.className = 'chart-hover-tooltip';
    document.body.appendChild(el);
  }

  const pri = req.adminPriority || req.aiPriority;
  const ful = req.adminFulfillment || req.aiFulfillment;

  el.innerHTML = `
    <div class="cht-header">
      <span class="cht-label">${escHtml(req.eventName)}</span>
    </div>
    <div class="cht-count">${escHtml(req.organization)} · ${escHtml(req.city)}</div>
    <div class="cht-cases">
      <div class="cht-case">${formatDate(req.eventDate)} · ${formatTime(req.startTime)}–${formatTime(req.endTime)}</div>
      <div class="cht-case">${statusBadge(req.status)} ${priorityBadge(pri)}</div>
      <div class="cht-case">${escHtml(req.requestType)} · ${escHtml(ful)}</div>
      <div class="cht-case">${escHtml(req.audienceType)} · Est. ${escHtml(req.estimatedAttendance)}</div>
      ${req.additionalNotes ? `<div class="cht-case" style="color:var(--c-text-secondary);font-style:italic;margin-top:0.2rem;">${escHtml(req.additionalNotes)}</div>` : ''}
    </div>
  `;

  el.classList.add('visible');

  const PAD = 14, vw = window.innerWidth, vh = window.innerHeight;
  const tw = el.offsetWidth || 240, th = el.offsetHeight || 140;
  let left = e.clientX + PAD;
  let top  = e.clientY + PAD;
  if (left + tw > vw - 8) left = e.clientX - tw - PAD;
  if (top  + th > vh - 8) top  = e.clientY - th - PAD;
  el.style.left = left + 'px';
  el.style.top  = top  + 'px';
}

function hideTimelineTooltip() {
  const el = document.getElementById('chart-hover-tooltip');
  if (el) el.classList.remove('visible');
}

function openTimelineDetail(req) {
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

  const cat = req.adminCategory || req.aiCategory;
  const pri = req.adminPriority || req.aiPriority;
  const ful = req.adminFulfillment || req.aiFulfillment;

  document.getElementById('chart-drilldown-title').innerHTML =
    `${escHtml(req.eventName)} <span style="font-weight:400;font-size:0.85rem;color:var(--c-text-secondary);">${req.id}</span>`;

  document.getElementById('chart-drilldown-body').innerHTML = `
    <div class="td-badges" style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem;">
      ${statusBadge(req.status)} ${priorityBadge(pri)} ${areaBadge(req.serviceArea)}
    </div>

    <div class="td-grid">
      <div class="td-section">
        <div class="td-section-title">Event</div>
        <div class="td-row"><span class="td-label">Date</span><span>${formatDate(req.eventDate)}</span></div>
        <div class="td-row"><span class="td-label">Time</span><span>${formatTime(req.startTime)} – ${formatTime(req.endTime)}</span></div>
        <div class="td-row"><span class="td-label">Location</span><span>${escHtml(req.eventLocation)}</span></div>
        <div class="td-row"><span class="td-label">City / ZIP</span><span>${escHtml(req.city)}, ${escHtml(req.zipCode)}</span></div>
        <div class="td-row"><span class="td-label">Audience</span><span>${escHtml(req.audienceType)}</span></div>
        <div class="td-row"><span class="td-label">Attendance</span><span>${escHtml(req.estimatedAttendance)}</span></div>
      </div>

      <div class="td-section">
        <div class="td-section-title">Requestor</div>
        <div class="td-row"><span class="td-label">Name</span><span>${escHtml(req.requestorName)}</span></div>
        <div class="td-row"><span class="td-label">Organization</span><span>${escHtml(req.organization)}</span></div>
        <div class="td-row"><span class="td-label">Email</span><span>${escHtml(req.email)}</span></div>
        <div class="td-row"><span class="td-label">Phone</span><span>${escHtml(req.phone || '—')}</span></div>
      </div>

      <div class="td-section">
        <div class="td-section-title">Request</div>
        <div class="td-row"><span class="td-label">Type</span><span>${escHtml(req.requestType)}</span></div>
        <div class="td-row"><span class="td-label">Fulfillment</span><span>${escHtml(ful)}</span></div>
        <div class="td-row"><span class="td-label">Category</span><span>${escHtml(cat)}</span></div>
        <div class="td-row"><span class="td-label">Materials</span><span>${req.materials && req.materials.length ? req.materials.join(', ') : '—'}</span></div>
        <div class="td-row"><span class="td-label">Staff Support</span><span>${escHtml(req.staffSupport || 'Not specified')}</span></div>
      </div>

      <div class="td-section">
        <div class="td-section-title">AI Insights</div>
        <div class="td-row"><span class="td-label">Category</span><span>${escHtml(req.aiCategory)}</span></div>
        <div class="td-row"><span class="td-label">Priority</span><span>${priorityBadge(req.aiPriority)}</span></div>
        <div class="td-row"><span class="td-label">Route</span><span>${escHtml(req.aiFulfillment)}</span></div>
        <div class="td-row"><span class="td-label">Staffing</span><span>${escHtml(req.aiStaffing)}</span></div>
        ${req.aiTags.length ? `<div class="td-row"><span class="td-label">Tags</span><span>${req.aiTags.map(t => `<span class="badge badge-submitted" style="margin-right:0.25rem;">${escHtml(t)}</span>`).join('')}</span></div>` : ''}
      </div>
    </div>

    ${req.eventDescription ? `
    <div class="td-section" style="margin-top:0.75rem;">
      <div class="td-section-title">Description</div>
      <p style="font-size:0.85rem;line-height:1.5;color:var(--c-text-secondary);margin:0;">${escHtml(req.eventDescription)}</p>
    </div>` : ''}

    ${req.additionalNotes ? `
    <div class="td-section" style="margin-top:0.75rem;">
      <div class="td-section-title">Notes</div>
      <p style="font-size:0.85rem;line-height:1.5;color:var(--c-text-secondary);margin:0;">${escHtml(req.additionalNotes)}</p>
    </div>` : ''}
  `;

  overlay.classList.add('visible');
}

// ==================== EVENT INVITE MODAL ====================
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('visible');
}

function openInviteModal(req) {
  const overlay = document.getElementById('modal-overlay');
  const body = document.getElementById('modal-body');

  body.innerHTML = `
    <p style="margin-bottom:1rem;">Generate an event invite for the approved request:</p>
    <div style="background:var(--c-bg);border-radius:var(--radius);padding:1rem;font-size:0.85rem;">
      <div style="margin-bottom:0.5rem;"><strong>${escHtml(req.eventName)}</strong></div>
      <div>Date: ${formatDate(req.eventDate)}</div>
      <div>Time: ${formatTime(req.startTime)} – ${formatTime(req.endTime)}</div>
      <div>Location: ${escHtml(req.eventLocation)}, ${escHtml(req.city)}</div>
      <div>Organization: ${escHtml(req.organization)}</div>
      <div>Contact: ${escHtml(req.requestorName)} (${escHtml(req.email)})</div>
    </div>
    <p style="margin-top:1rem;font-size:0.85rem;color:var(--c-text-secondary);">This will generate a calendar invite and notification email to the requestor and assigned staff.</p>
  `;

  document.getElementById('btn-send-invite').onclick = () => {
    closeModal();
    showToast('Event invite generated and sent to ' + req.email);
  };
  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

  overlay.classList.add('visible');
}
