/* =============================================
   AI Simulation Engine
   Categorization, priority, fulfillment, NLP
   ============================================= */

// ---- Service Area ZIP Codes ----
const SERVICE_AREA_ZIPS = new Set([
  '62701','62702','62703','62704','62706','62707','62711','62712',
  '62521','62522','62523','62526',
  '61701','61702','61704','61705',
  '61801','61802','61820','61821',
  '62901','62902','62903',
  '60601','60602','60603','60604','60605','60606','60607','60608',
  '60609','60610','60611','60612','60614','60615','60616','60618',
  '60619','60620','60621','60622','60623','60624','60625','60626',
  '60628','60629','60630','60631','60632','60636','60637','60638',
  '60639','60640','60641','60642','60643','60644','60645','60646',
  '60647','60649','60651','60652','60653','60655','60656','60657',
  '60659','60660','60661','60666',
  '62002','62010','62025','62040','62060','62234','62249','62269',
  '62801','62864','62946'
]);

const BORDERLINE_ZIPS = new Set([
  '61611','61614','62650','62656','62881','62832','62863'
]);

// ---- AI Module ----
const AI = {
  categorize(req) {
    const desc = (req.eventDescription + ' ' + req.eventName).toLowerCase();
    if (desc.match(/school|student|k-12|classroom|campus/)) return 'School Event';
    if (desc.match(/church|faith|congregation|ministry/)) return 'Community Outreach';
    if (desc.match(/hospital|clinic|internal|employee|staff meeting/)) return 'Internal Program';
    if (desc.match(/health\s*(fair|screen|educat|literacy|wellness)/)) return 'Health Education';
    if (desc.match(/fundrai|gala|auction|benefit|donation/)) return 'Fundraising';
    if (desc.match(/partner|coalition|agency|nonprofit|collab/)) return 'Partner Request';
    if (desc.match(/festival|carnival|parade|celebration|block\s*party/)) return 'Special Event';
    if (req.requestType === 'Toolkit Request') return 'Partner Request';
    return 'Community Outreach';
  },

  determinePriority(req) {
    let score = 0;
    const attendance = parseInt(req.estimatedAttendance) || 0;
    if (attendance > 500) score += 3;
    else if (attendance > 200) score += 2;
    else if (attendance > 50) score += 1;

    const eventDate = new Date(req.eventDate);
    const now = new Date();
    const daysUntil = (eventDate - now) / (1000 * 60 * 60 * 24);
    if (daysUntil < 5) score += 3;
    else if (daysUntil < 14) score += 2;
    else if (daysUntil < 30) score += 1;

    if (req.requestType === 'Staffed Event Support' || req.requestType === 'Staffing + Materials') score += 1;
    if (req.staffSupport === '5+ Staff') score += 1;

    if (score >= 6) return 'Urgent';
    if (score >= 4) return 'High';
    if (score >= 2) return 'Medium';
    return 'Low';
  },

  recommendFulfillment(req) {
    const area = AI.checkServiceArea(req.zipCode);
    if (area === 'Out of Area') return 'Mail Fulfillment';
    if (req.requestType === 'Toolkit Request' || req.requestType === 'Materials Only') {
      if (req.preferredFulfillment === 'Pickup') return 'Pickup Preparation';
      return 'Mail Fulfillment';
    }
    if (req.requestType === 'Staffed Event Support' || req.requestType === 'Staffing + Materials') return 'Staff Deployment';
    if (req.preferredFulfillment === 'Staff Deployment') return 'Staff Deployment';
    if (req.preferredFulfillment === 'Mail') return 'Mail Fulfillment';
    if (req.preferredFulfillment === 'Pickup') return 'Pickup Preparation';
    return 'Staff Deployment';
  },

  recommendStaffing(req) {
    const attendance = parseInt(req.estimatedAttendance) || 0;
    if (req.requestType === 'Materials Only' || req.requestType === 'Toolkit Request') return '0 staff (materials only)';
    if (attendance > 500) return '5–8 staff recommended';
    if (attendance > 200) return '3–5 staff recommended';
    if (attendance > 50) return '2–3 staff recommended';
    return '1–2 staff recommended';
  },

  checkServiceArea(zip) {
    if (SERVICE_AREA_ZIPS.has(zip)) return 'In Area';
    if (BORDERLINE_ZIPS.has(zip)) return 'Review Needed';
    return 'Out of Area';
  },

  interpretDescription(desc) {
    const insights = [];
    const lower = desc.toLowerCase();
    if (lower.match(/screen|blood\s*pressure|bmi|glucose|a1c/)) insights.push('Health screening services detected');
    if (lower.match(/vaccine|immuniz|flu\s*shot|covid/)) insights.push('Vaccination/immunization component');
    if (lower.match(/food|nutrition|diet|cook/)) insights.push('Nutrition education component');
    if (lower.match(/mental\s*health|stress|counsel|therapy/)) insights.push('Mental health focus identified');
    if (lower.match(/child|kid|youth|teen|pediatric/)) insights.push('Youth-focused programming');
    if (lower.match(/senior|elder|aging|medicare/)) insights.push('Senior-focused programming');
    if (lower.match(/spanish|bilingual|translat/)) insights.push('Bilingual support may be needed');
    if (lower.match(/outdoor|park|field|tent/)) insights.push('Outdoor event — weather contingency advised');
    return insights;
  },

  generateTags(req) {
    const tags = [];
    tags.push(req.audienceType);
    if (parseInt(req.estimatedAttendance) > 200) tags.push('Large Event');
    if (req.materials && req.materials.length > 3) tags.push('Multi-Material');
    if (req.staffSupport && req.staffSupport !== 'None') tags.push('Staffing Required');
    return tags;
  }
};

/** Run all AI enrichment on raw form data, return a full request object */
function processNewRequest(data) {
  const req = {
    id: 'REQ-' + Store.nextId++,
    submittedAt: new Date().toISOString(),
    status: 'Submitted',
    ...data,
    aiCategory: AI.categorize(data),
    aiPriority: AI.determinePriority(data),
    aiFulfillment: AI.recommendFulfillment(data),
    aiStaffing: AI.recommendStaffing(data),
    serviceArea: AI.checkServiceArea(data.zipCode),
    aiInsights: AI.interpretDescription(data.eventDescription),
    aiTags: AI.generateTags(data),
    adminCategory: null,
    adminPriority: null,
    adminFulfillment: null,
    adminNotes: ''
  };
  return req;
}
