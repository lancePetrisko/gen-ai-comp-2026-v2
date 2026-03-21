/* =============================================
   User Dashboard Page Logic
   Read-only view of a single user's requests
   ============================================= */

// Mock staff names for staffing assignments
const MOCK_STAFF = [
  { name: 'Sarah Chen', initials: 'SC' },
  { name: 'David Martinez', initials: 'DM' },
  { name: 'Keisha Brown', initials: 'KB' },
  { name: 'James O\'Connor', initials: 'JO' },
  { name: 'Priya Sharma', initials: 'PS' },
  { name: 'Michael Torres', initials: 'MT' },
  { name: 'Angela Williams', initials: 'AW' },
  { name: 'Ryan Patel', initials: 'RP' }
];

const STATUS_FLOW = ['Submitted', 'In Review', 'Approved', 'Fulfilled'];

let currentUserName = '';
let userRequests = [];

document.addEventListener('DOMContentLoaded', () => {
  Store.load();
  seedDemoDataIfNeeded();

  currentUserName = localStorage.getItem('chp_user_name') || '';
  if (!currentUserName) {
    window.location.href = 'user-login.html';
    return;
  }

  // Filter to this user's requests
  userRequests = Store.requests.filter(r => r.requestorName === currentUserName);

  // Set header
  const org = userRequests.length > 0 ? userRequests[0].organization : '';
  document.getElementById('user-welcome').textContent = 'Welcome back, ' + currentUserName;
  document.getElementById('user-org').textContent = org;

  renderUserCounts();
  renderUserTable();

  document.getElementById('user-detail-close').addEventListener('click', closeUserDetail);
});

function seedDemoDataIfNeeded() {
  if (Store.requests.length > 0) return;
  DEMO_REQUESTS.forEach(data => {
    const req = processNewRequest({ ...data });
    req.status = data.status;
    Store.requests.push(req);
  });
  Store.save();
}

// ==================== SUMMARY COUNTS ====================
function renderUserCounts() {
  const r = userRequests;
  document.getElementById('u-count-total').textContent = r.length;
  document.getElementById('u-count-pending').textContent = r.filter(x => x.status === 'Submitted' || x.status === 'In Review').length;
  document.getElementById('u-count-approved').textContent = r.filter(x => x.status === 'Approved' || x.status === 'Sent to Qualtrics').length;
  document.getElementById('u-count-fulfilled').textContent = r.filter(x => x.status === 'Fulfilled').length;
  document.getElementById('u-count-denied').textContent = r.filter(x => x.status === 'Denied').length;
}

// ==================== TABLE ====================
function renderUserTable() {
  const tbody = document.getElementById('user-tbody');
  const empty = document.getElementById('user-empty');

  if (userRequests.length === 0) {
    tbody.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  tbody.innerHTML = userRequests.map(r => {
    const pri = r.adminPriority || r.aiPriority;
    const ful = r.adminFulfillment || r.aiFulfillment;
    return `<tr data-id="${r.id}" tabindex="0">
      <td><strong>${r.id}</strong></td>
      <td>${escHtml(r.eventName)}</td>
      <td>${formatDate(r.eventDate)}</td>
      <td>${statusBadge(r.status)}</td>
      <td>${priorityBadge(pri)}</td>
      <td>${escHtml(ful)}</td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('tr').forEach(tr => {
    tr.addEventListener('click', () => openUserDetail(tr.dataset.id));
    tr.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openUserDetail(tr.dataset.id); }
    });
  });
}

// ==================== DETAIL PANEL ====================
function openUserDetail(id) {
  const req = userRequests.find(r => r.id === id);
  if (!req) return;

  // Highlight row
  document.querySelectorAll('.queue-table tbody tr').forEach(tr => {
    tr.classList.toggle('selected', tr.dataset.id === id);
  });

  const panel = document.getElementById('user-detail');
  const grid = document.getElementById('user-grid');
  panel.hidden = false;
  grid.classList.remove('no-detail');

  renderUserDetailBody(req);
}

function closeUserDetail() {
  document.getElementById('user-detail').hidden = true;
  document.getElementById('user-grid').classList.add('no-detail');
  document.querySelectorAll('.queue-table tbody tr').forEach(tr => tr.classList.remove('selected'));
}

function renderUserDetailBody(req) {
  const body = document.getElementById('user-detail-body');
  const pri = req.adminPriority || req.aiPriority;
  const ful = req.adminFulfillment || req.aiFulfillment;

  body.innerHTML = `
    <!-- Status Tracker -->
    <div class="detail-section">
      <div class="detail-section-title">Request Status</div>
      ${buildStatusTracker(req.status)}
    </div>

    <!-- Event Details -->
    <div class="detail-section">
      <div class="detail-section-title">Event Details</div>
      <div class="detail-row"><span class="detail-label">Event</span><span class="detail-value">${escHtml(req.eventName)}</span></div>
      <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${formatDate(req.eventDate)}</span></div>
      <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${formatTime(req.startTime)} – ${formatTime(req.endTime)}</span></div>
      <div class="detail-row"><span class="detail-label">Location</span><span class="detail-value">${escHtml(req.eventLocation)}</span></div>
      <div class="detail-row"><span class="detail-label">City / ZIP</span><span class="detail-value">${escHtml(req.city)}, ${escHtml(req.zipCode)}</span></div>
    </div>

    <!-- Request Details -->
    <div class="detail-section">
      <div class="detail-section-title">Request Details</div>
      <div class="detail-row"><span class="detail-label">Request Type</span><span class="detail-value">${escHtml(req.requestType)}</span></div>
      <div class="detail-row"><span class="detail-label">Fulfillment</span><span class="detail-value">${escHtml(ful)}</span></div>
      <div class="detail-row"><span class="detail-label">Materials</span><span class="detail-value">${req.materials && req.materials.length ? req.materials.join(', ') : '—'}</span></div>
      <div class="detail-row"><span class="detail-label">Staff Support</span><span class="detail-value">${escHtml(req.staffSupport || 'Not specified')}</span></div>
      <div class="detail-row"><span class="detail-label">Audience</span><span class="detail-value">${escHtml(req.audienceType)}</span></div>
      <div class="detail-row"><span class="detail-label">Est. Attendance</span><span class="detail-value">${escHtml(req.estimatedAttendance)}</span></div>
    </div>

    <!-- Routing Info -->
    <div class="ai-suggestion-box">
      <div class="ai-tag">
        <svg viewBox="0 0 20 20"><path d="M10 2a1 1 0 0 1 1 1v1.07A7 7 0 0 1 16.93 10H18a1 1 0 1 1 0 2h-1.07A7 7 0 0 1 11 17.93V19a1 1 0 1 1-2 0v-1.07A7 7 0 0 1 3.07 12H2a1 1 0 1 1 0-2h1.07A7 7 0 0 1 9 4.07V3a1 1 0 0 1 1-1zm0 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" fill="currentColor"/></svg>
        How Your Request Is Being Handled
      </div>
      <div class="ai-row"><span class="ai-label">Fulfillment Path</span><span class="ai-value">${escHtml(ful)}</span></div>
      <div class="ai-row"><span class="ai-label">Service Area</span><span class="ai-value">${areaBadge(req.serviceArea)}</span></div>
      <div class="ai-row"><span class="ai-label">Priority</span><span class="ai-value">${priorityBadge(pri)}</span></div>
    </div>

    <!-- Staff Assigned (if approved + staffing) -->
    ${buildStaffSection(req)}

    <!-- Team Notes -->
    ${req.adminNotes ? `
    <div class="detail-section">
      <div class="detail-section-title">Team Notes</div>
      <p style="font-size:0.85rem;line-height:1.5;color:var(--c-text-secondary);">${escHtml(req.adminNotes)}</p>
    </div>
    ` : ''}

    <!-- Key Dates -->
    <div class="detail-section">
      <div class="detail-section-title">Key Dates</div>
      <div class="detail-row"><span class="detail-label">Submitted</span><span class="detail-value">${new Date(req.submittedAt).toLocaleDateString()}</span></div>
      <div class="detail-row"><span class="detail-label">Event Date</span><span class="detail-value">${formatDate(req.eventDate)}</span></div>
      <div class="detail-row"><span class="detail-label">Request ID</span><span class="detail-value">${req.id}</span></div>
    </div>
  `;
}

// ==================== STATUS TRACKER ====================
function buildStatusTracker(status) {
  const isDenied = status === 'Denied';

  if (isDenied) {
    // Show a simplified tracker ending in Denied
    const deniedFlow = ['Submitted', 'In Review', 'Denied'];
    return `<div class="status-tracker">${deniedFlow.map((step, i) => {
      let cls = '';
      if (step === 'Denied') cls = 'denied';
      else cls = 'completed';
      const icon = step === 'Denied' ? '✕' : '✓';
      return `<div class="status-step ${cls}">
        <div class="status-step-line"></div>
        <div class="status-step-dot">${icon}</div>
        <span class="status-step-label">${step}</span>
      </div>`;
    }).join('')}</div>`;
  }

  // Normal flow
  const currentIdx = STATUS_FLOW.indexOf(status);
  // Handle "Sent to Qualtrics" as being between Approved and Fulfilled
  const effectiveIdx = status === 'Sent to Qualtrics' ? 2 : currentIdx;

  return `<div class="status-tracker">${STATUS_FLOW.map((step, i) => {
    let cls = '';
    let icon = (i + 1).toString();
    if (i < effectiveIdx) { cls = 'completed'; icon = '✓'; }
    else if (i === effectiveIdx) { cls = 'active'; icon = (i + 1).toString(); }
    return `<div class="status-step ${cls}">
      <div class="status-step-line"></div>
      <div class="status-step-dot">${icon}</div>
      <span class="status-step-label">${step}</span>
    </div>`;
  }).join('')}</div>`;
}

// ==================== STAFF ASSIGNED ====================
function buildStaffSection(req) {
  const needsStaff = req.requestType === 'Staffed Event Support' || req.requestType === 'Staffing + Materials';
  const isApproved = req.status === 'Approved' || req.status === 'Sent to Qualtrics' || req.status === 'Fulfilled';

  if (!needsStaff || !isApproved) return '';

  // Determine how many staff to show based on staffSupport
  let count = 2;
  if (req.staffSupport === '3-5 Staff') count = 4;
  else if (req.staffSupport === '5+ Staff') count = 6;
  else if (req.staffSupport === '1-2 Staff') count = 2;

  // Pick deterministic mock staff based on request id
  const seed = parseInt(req.id.replace(/\D/g, '')) || 0;
  const assigned = [];
  for (let i = 0; i < count; i++) {
    assigned.push(MOCK_STAFF[(seed + i) % MOCK_STAFF.length]);
  }

  return `
    <div class="detail-section">
      <div class="detail-section-title">Staff Assigned (${count})</div>
      <ul class="staff-assigned-list">
        ${assigned.map(s => `
          <li>
            <span class="staff-avatar">${s.initials}</span>
            <span>${escHtml(s.name)}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}
