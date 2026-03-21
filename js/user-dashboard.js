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

  document.getElementById('user-back-btn').addEventListener('click', closeUserDetail);
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

// ==================== DETAIL VIEW ====================
function openUserDetail(id) {
  const req = userRequests.find(r => r.id === id);
  if (!req) return;

  // Hide list, show detail
  document.getElementById('user-list-view').hidden = true;
  document.getElementById('user-detail-view').hidden = false;

  renderUserDetailBody(req);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeUserDetail() {
  document.getElementById('user-detail-view').hidden = true;
  document.getElementById('user-list-view').hidden = false;
}

function renderUserDetailBody(req) {
  const body = document.getElementById('user-detail-body');
  const pri = req.adminPriority || req.aiPriority;
  const ful = req.adminFulfillment || req.aiFulfillment;

  body.innerHTML = `
    <!-- Header Card -->
    <div class="udf-card udf-full-width">
      <div class="udf-event-header">
        <div>
          <h2>${escHtml(req.eventName)}</h2>
          <div class="udf-event-meta">
            ${statusBadge(req.status)}
            ${priorityBadge(pri)}
            ${areaBadge(req.serviceArea)}
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.8rem;color:var(--c-text-secondary);">Request ID</div>
          <div style="font-weight:700;font-size:1rem;">${req.id}</div>
        </div>
      </div>
    </div>

    <!-- Status Tracker -->
    <div class="udf-card udf-full-width">
      <div class="detail-section-title" style="margin-bottom:0.5rem;">Request Progress</div>
      ${buildStatusTracker(req.status)}
    </div>

    <!-- Event Details -->
    <div class="udf-card">
      <div class="detail-section-title">Event Details</div>
      <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${formatDate(req.eventDate)}</span></div>
      <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${formatTime(req.startTime)} – ${formatTime(req.endTime)}</span></div>
      <div class="detail-row"><span class="detail-label">Location</span><span class="detail-value">${escHtml(req.eventLocation)}</span></div>
      <div class="detail-row"><span class="detail-label">City / ZIP</span><span class="detail-value">${escHtml(req.city)}, ${escHtml(req.zipCode)}</span></div>
      <div class="detail-row"><span class="detail-label">Audience</span><span class="detail-value">${escHtml(req.audienceType)}</span></div>
      <div class="detail-row"><span class="detail-label">Est. Attendance</span><span class="detail-value">${escHtml(req.estimatedAttendance)}</span></div>
    </div>

    <!-- Location Map -->
    <div class="udf-card udf-full-width">
      <div class="detail-section-title">Event Location</div>
      <div style="display:flex;gap:1.25rem;flex-wrap:wrap;">
        <div style="flex:1;min-width:280px;">
          <iframe
            width="100%"
            height="260"
            style="border:0;border-radius:var(--radius);display:block;"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=${encodeURIComponent(req.eventLocation + ', ' + req.city + ' ' + req.zipCode)}&output=embed"
            allowfullscreen
            aria-label="Map showing event location"
          ></iframe>
        </div>
        <div style="flex:0 0 220px;display:flex;flex-direction:column;justify-content:center;gap:0.3rem;font-size:0.88rem;">
          <div style="font-weight:700;">${escHtml(req.eventLocation)}</div>
          <div style="color:var(--c-text-secondary);">${escHtml(req.city)}, ${escHtml(req.zipCode)}</div>
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(req.eventLocation + ', ' + req.city + ' ' + req.zipCode)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="margin-top:0.5rem;width:fit-content;">
            <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 9 7 9s7-3.75 7-9c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="currentColor"/></svg>
            Open in Google Maps
          </a>
        </div>
      </div>
    </div>

    <!-- Request Details -->
    <div class="udf-card">
      <div class="detail-section-title">Request Details</div>
      <div class="detail-row"><span class="detail-label">Request Type</span><span class="detail-value">${escHtml(req.requestType)}</span></div>
      <div class="detail-row"><span class="detail-label">Fulfillment</span><span class="detail-value">${escHtml(ful)}</span></div>
      <div class="detail-row"><span class="detail-label">Materials</span><span class="detail-value">${req.materials && req.materials.length ? req.materials.join(', ') : '—'}</span></div>
      <div class="detail-row"><span class="detail-label">Staff Support</span><span class="detail-value">${escHtml(req.staffSupport || 'Not specified')}</span></div>
    </div>

    <!-- How Your Request Is Being Handled -->
    <div class="udf-card">
      <div class="ai-suggestion-box" style="margin-bottom:0;">
        <div class="ai-tag">
          <svg viewBox="0 0 20 20"><path d="M10 2a1 1 0 0 1 1 1v1.07A7 7 0 0 1 16.93 10H18a1 1 0 1 1 0 2h-1.07A7 7 0 0 1 11 17.93V19a1 1 0 1 1-2 0v-1.07A7 7 0 0 1 3.07 12H2a1 1 0 1 1 0-2h1.07A7 7 0 0 1 9 4.07V3a1 1 0 0 1 1-1zm0 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" fill="currentColor"/></svg>
          How Your Request Is Being Handled
        </div>
        <div class="ai-row"><span class="ai-label">Fulfillment Path</span><span class="ai-value">${escHtml(ful)}</span></div>
        <div class="ai-row"><span class="ai-label">Service Area</span><span class="ai-value">${areaBadge(req.serviceArea)}</span></div>
        <div class="ai-row"><span class="ai-label">Priority Level</span><span class="ai-value">${priorityBadge(pri)}</span></div>
        <div class="ai-row"><span class="ai-label">Category</span><span class="ai-value">${escHtml(req.adminCategory || req.aiCategory)}</span></div>
      </div>
    </div>

    <!-- Staff Assigned -->
    ${buildStaffCard(req)}

    <!-- Key Dates -->
    <div class="udf-card">
      <div class="detail-section-title">Key Dates</div>
      <div class="detail-row"><span class="detail-label">Submitted</span><span class="detail-value">${new Date(req.submittedAt).toLocaleDateString()}</span></div>
      <div class="detail-row"><span class="detail-label">Event Date</span><span class="detail-value">${formatDate(req.eventDate)}</span></div>
    </div>

    <!-- Team Notes -->
    ${req.adminNotes ? `
    <div class="udf-card">
      <div class="detail-section-title">Team Notes</div>
      <p style="font-size:0.88rem;line-height:1.6;color:var(--c-text-secondary);margin:0;">${escHtml(req.adminNotes)}</p>
    </div>
    ` : ''}

    <!-- Description -->
    <div class="udf-card udf-full-width">
      <div class="detail-section-title">Event Description</div>
      <p style="font-size:0.88rem;line-height:1.6;color:var(--c-text-secondary);margin:0;">${escHtml(req.eventDescription)}</p>
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
function buildStaffCard(req) {
  const needsStaff = req.requestType === 'Staffed Event Support' || req.requestType === 'Staffing + Materials';
  const isApproved = req.status === 'Approved' || req.status === 'Sent to Qualtrics' || req.status === 'Fulfilled';

  if (!needsStaff && !isApproved) {
    return `<div class="udf-card">
      <div class="detail-section-title">Staff Assignment</div>
      <p style="font-size:0.85rem;color:var(--c-text-secondary);margin:0;">No staffing requested for this event.</p>
    </div>`;
  }
  if (needsStaff && !isApproved) {
    return `<div class="udf-card">
      <div class="detail-section-title">Staff Assignment</div>
      <p style="font-size:0.85rem;color:var(--c-text-secondary);margin:0;">Staff will be assigned once your request is approved.</p>
    </div>`;
  }

  let count = 2;
  if (req.staffSupport === '3-5 Staff') count = 4;
  else if (req.staffSupport === '5+ Staff') count = 6;
  else if (req.staffSupport === '1-2 Staff') count = 2;

  const seed = parseInt(req.id.replace(/\D/g, '')) || 0;
  const assigned = [];
  for (let i = 0; i < count; i++) {
    assigned.push(MOCK_STAFF[(seed + i) % MOCK_STAFF.length]);
  }

  return `
    <div class="udf-card">
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
