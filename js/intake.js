/* =============================================
   Intake Form Page Logic
   Demo loader, validation, submission
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  Store.load();
  seedDemoDataIfNeeded();
  initDemoSelect();
  initIntakeForm();
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

/** Populate the demo dropdown */
function initDemoSelect() {
  const sel = document.getElementById('demo-select');
  DEMO_SELECT_OPTIONS.forEach(opt => {
    const o = document.createElement('option');
    o.value = opt.index;
    o.textContent = opt.label;
    sel.appendChild(o);
  });

  sel.addEventListener('change', () => {
    if (sel.value === '') return;
    const demo = DEMO_REQUESTS[parseInt(sel.value)];
    populateForm(demo);
  });
}

/** Wire up form submission, reset, and validation */
function initIntakeForm() {
  const form = document.getElementById('intake-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const data = extractFormData(form);
    const req = processNewRequest(data);
    Store.requests.unshift(req);
    Store.save();

    // Show confirmation
    form.hidden = true;
    document.querySelector('.demo-loader-wrap').hidden = true;
    const confirm = document.getElementById('intake-confirmation');
    confirm.hidden = false;
    document.getElementById('confirm-request-id').textContent = req.id;
  });

  document.getElementById('btn-new-request').addEventListener('click', () => {
    form.reset();
    form.hidden = false;
    document.querySelector('.demo-loader-wrap').hidden = false;
    document.getElementById('intake-confirmation').hidden = true;
    document.getElementById('demo-select').value = '';
    clearValidation(form);
  });

  // Real-time validation
  form.querySelectorAll('input[required], select[required], textarea[required]').forEach(el => {
    el.addEventListener('blur', () => validateField(el));
    el.addEventListener('input', () => {
      if (el.classList.contains('invalid')) validateField(el);
    });
  });
}

function populateForm(data) {
  const form = document.getElementById('intake-form');
  const fields = ['requestorName', 'organization', 'email', 'phone', 'eventName',
    'eventDescription', 'eventDate', 'startTime', 'endTime', 'eventLocation',
    'city', 'zipCode', 'audienceType', 'estimatedAttendance', 'requestType',
    'preferredFulfillment', 'additionalNotes'];

  fields.forEach(f => {
    const el = form.querySelector(`[name="${f}"]`);
    if (el && data[f] !== undefined) el.value = data[f];
  });

  form.querySelectorAll('input[name="materials"]').forEach(cb => {
    cb.checked = data.materials && data.materials.includes(cb.value);
  });

  form.querySelectorAll('input[name="staffSupport"]').forEach(r => {
    r.checked = r.value === data.staffSupport;
  });

  clearValidation(form);
}

function extractFormData(form) {
  const fd = new FormData(form);
  const data = {};
  for (const [key, val] of fd.entries()) {
    if (key === 'materials') {
      if (!data.materials) data.materials = [];
      data.materials.push(val);
    } else {
      data[key] = val;
    }
  }
  if (!data.materials) data.materials = [];
  return data;
}

function validateForm(form) {
  let valid = true;
  form.querySelectorAll('input[required], select[required], textarea[required]').forEach(el => {
    if (!validateField(el)) valid = false;
  });
  if (!valid) {
    const first = form.querySelector('.invalid');
    if (first) first.focus();
  }
  return valid;
}

function validateField(el) {
  const existing = el.parentElement.querySelector('.error-text');
  if (existing) existing.remove();

  let valid = true;
  let msg = '';

  if (el.required && !el.value.trim()) {
    valid = false;
    msg = 'This field is required';
  } else if (el.type === 'email' && el.value && !el.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    valid = false;
    msg = 'Please enter a valid email address';
  } else if (el.name === 'zipCode' && el.value && !el.value.match(/^\d{5}$/)) {
    valid = false;
    msg = 'Please enter a valid 5-digit ZIP code';
  }

  el.classList.toggle('invalid', !valid);
  if (!valid) {
    const err = document.createElement('span');
    err.className = 'error-text';
    err.textContent = msg;
    err.setAttribute('role', 'alert');
    el.parentElement.appendChild(err);
  }
  return valid;
}

function clearValidation(form) {
  form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
  form.querySelectorAll('.error-text').forEach(el => el.remove());
}
