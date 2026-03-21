/* =============================================
   Utility / Helper Functions
   ============================================= */

function escHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hr = parseInt(h);
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const hr12 = hr % 12 || 12;
  return `${hr12}:${m} ${ampm}`;
}

function statusBadge(status) {
  const classes = {
    'Submitted': 'badge-submitted',
    'In Review': 'badge-in-review',
    'Approved': 'badge-approved',
    'Sent to Qualtrics': 'badge-qualtrics',
    'Fulfilled': 'badge-fulfilled'
  };
  return `<span class="badge ${classes[status] || ''}">${escHtml(status)}</span>`;
}

function priorityBadge(priority) {
  const classes = {
    'Low': 'badge-low',
    'Medium': 'badge-medium',
    'High': 'badge-high',
    'Urgent': 'badge-urgent'
  };
  return `<span class="badge ${classes[priority] || ''}">${escHtml(priority)}</span>`;
}

function areaBadge(area) {
  const classes = {
    'In Area': 'badge-in-area',
    'Out of Area': 'badge-out-of-area',
    'Review Needed': 'badge-review-needed'
  };
  return `<span class="badge ${classes[area] || ''}">${escHtml(area)}</span>`;
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 3000);
}
