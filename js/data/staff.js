/* =============================================
   Staff Mock Data
   ============================================= */

const SCENARIO_LABELS = {
  childcare:       'Childcare',
  eldercare:       'Eldercare',
  schoolEvents:    'School Events',
  outreach:        'Community Outreach',
  behaviorSupport: 'Behavior Support',
  translation:     'Translation'
};

const STAFF = [
  {
    id: 'STF-001',
    name: 'Maria Chen',
    avatar: 'MC',
    status: 'Available',
    title: 'Community Health Coordinator',
    skills: ['childcare', 'translation', 'community outreach'],
    languages: ['English', 'Mandarin'],
    overallRating: 4.8,
    eventsWorked: 34,
    nextAvailable: 'Now',
    currentAssignment: null,
    phone: '801-555-0142',
    email: 'maria.chen@ihhealth.org',
    scenarioRatings: { childcare: 5, eldercare: 3, schoolEvents: 4, outreach: 5, behaviorSupport: 3, translation: 5 },
    eventHistory: [
      { eventName: 'East Side Health Fair',         date: '2026-02-15', role: 'Lead Coordinator',  notes: 'Excellent with families and bilingual attendees.' },
      { eventName: 'Lincoln Elementary Wellness Day', date: '2026-01-20', role: 'Staff Support',    notes: 'Great rapport with kids. Parents appreciated her.' },
      { eventName: 'Mandarin Community Outreach',   date: '2025-12-10', role: 'Translator',        notes: 'Invaluable Mandarin translation — critical for event success.' }
    ],
    notes: 'Highly reliable. Excels in bilingual events and family-focused programs. Always arrives early and well-prepared.'
  },
  {
    id: 'STF-002',
    name: 'James Rodriguez',
    avatar: 'JR',
    status: 'Actively Working',
    title: 'Senior Health Educator',
    skills: ['eldercare', 'translation', 'behavior reinforcement'],
    languages: ['English', 'Spanish'],
    overallRating: 4.6,
    eventsWorked: 52,
    nextAvailable: 'Mar 22, 2:00 PM',
    currentAssignment: 'Senior Wellness Expo',
    phone: '801-555-0187',
    email: 'james.rodriguez@ihhealth.org',
    scenarioRatings: { childcare: 2, eldercare: 5, schoolEvents: 2, outreach: 4, behaviorSupport: 5, translation: 5 },
    eventHistory: [
      { eventName: 'Senior Wellness Expo',         date: '2026-03-21', role: 'Lead Educator',        notes: 'Outstanding with elderly attendees — patient and thorough.' },
      { eventName: 'Hispanic Heritage Health Day', date: '2026-02-28', role: 'Translator / Educator', notes: 'Great cultural sensitivity and community trust.' },
      { eventName: 'Memory Care Outreach',         date: '2026-01-15', role: 'Behavior Support',      notes: 'Exceptional patience in a difficult environment.' }
    ],
    notes: 'Most experienced with eldercare and Spanish-speaking communities. Outstanding behavior reinforcement skills. Currently assigned.'
  },
  {
    id: 'STF-003',
    name: 'Sarah Kim',
    avatar: 'SK',
    status: 'Available',
    title: 'School Health Liaison',
    skills: ['school events', 'childcare', 'community outreach'],
    languages: ['English'],
    overallRating: 4.7,
    eventsWorked: 28,
    nextAvailable: 'Now',
    currentAssignment: null,
    phone: '801-555-0213',
    email: 'sarah.kim@ihhealth.org',
    scenarioRatings: { childcare: 5, eldercare: 2, schoolEvents: 5, outreach: 4, behaviorSupport: 4, translation: 1 },
    eventHistory: [
      { eventName: 'Eastview Middle School Health Expo', date: '2026-03-10', role: 'Lead Coordinator', notes: 'Students loved her energy. Exceptional engagement.' },
      { eventName: 'Back to School Wellness Fair',       date: '2026-02-01', role: 'Staff Support',    notes: 'Organized and efficient. Great partnership with school staff.' },
      { eventName: 'Elementary Mental Health Day',       date: '2025-11-20', role: 'Childcare Support', notes: 'Excellent rapport with young children.' }
    ],
    notes: 'Go-to person for school events. Strong relationships with school district contacts. Best childcare + school pairing on the team.'
  },
  {
    id: 'STF-004',
    name: 'David Thompson',
    avatar: 'DT',
    status: 'On Break',
    title: 'Community Outreach Specialist',
    skills: ['eldercare', 'behavior reinforcement', 'community outreach'],
    languages: ['English'],
    overallRating: 4.3,
    eventsWorked: 41,
    nextAvailable: 'Mar 24, 9:00 AM',
    currentAssignment: null,
    phone: '801-555-0098',
    email: 'david.thompson@ihhealth.org',
    scenarioRatings: { childcare: 2, eldercare: 4, schoolEvents: 2, outreach: 5, behaviorSupport: 5, translation: 1 },
    eventHistory: [
      { eventName: 'Downtown Health Resource Fair',  date: '2026-03-05', role: 'Outreach Lead',    notes: 'Covered a large footprint efficiently. Strong community presence.' },
      { eventName: 'Crisis Support Community Event', date: '2026-02-10', role: 'Behavior Support', notes: 'Handled difficult situations with calm professionalism.' },
      { eventName: 'Senior Living Outreach',         date: '2026-01-08', role: 'Eldercare Support', notes: 'Very patient and thorough with residents.' }
    ],
    notes: 'Expert in de-escalation and behavior support. On scheduled break until Mar 24. Top outreach performer when available.'
  },
  {
    id: 'STF-005',
    name: 'Aisha Williams',
    avatar: 'AW',
    status: 'Available',
    title: 'Health Equity Coordinator',
    skills: ['school events', 'community outreach', 'translation'],
    languages: ['English', 'French'],
    overallRating: 4.9,
    eventsWorked: 19,
    nextAvailable: 'Now',
    currentAssignment: null,
    phone: '801-555-0334',
    email: 'aisha.williams@ihhealth.org',
    scenarioRatings: { childcare: 4, eldercare: 3, schoolEvents: 5, outreach: 5, behaviorSupport: 3, translation: 4 },
    eventHistory: [
      { eventName: 'Multicultural Health Symposium',   date: '2026-03-15', role: 'Lead Coordinator',      notes: 'Exceptional community engagement across cultures.' },
      { eventName: 'Title I School Health Day',         date: '2026-02-20', role: 'Health Educator',       notes: 'Strong equity lens. Very effective with underserved students.' },
      { eventName: 'Refugee Community Health Outreach', date: '2026-01-25', role: 'Translator / Outreach', notes: 'French translation was a critical asset for this event.' }
    ],
    notes: 'Rising star. Highest rated on team. Exceptional equity focus and deep community trust. High-energy presenter.'
  },
  {
    id: 'STF-006',
    name: 'Michael Torres',
    avatar: 'MT',
    status: 'Unavailable',
    title: 'Family Health Specialist',
    skills: ['childcare', 'eldercare', 'community outreach'],
    languages: ['English', 'Spanish'],
    overallRating: 4.4,
    eventsWorked: 37,
    nextAvailable: 'Mar 28, 8:00 AM',
    currentAssignment: null,
    phone: '801-555-0421',
    email: 'michael.torres@ihhealth.org',
    scenarioRatings: { childcare: 4, eldercare: 4, schoolEvents: 3, outreach: 4, behaviorSupport: 3, translation: 4 },
    eventHistory: [
      { eventName: 'Family Wellness Weekend',          date: '2026-03-01', role: 'Family Support',   notes: 'Great with multi-generational families. Both kids and seniors loved him.' },
      { eventName: 'Westside Community Health Day',    date: '2026-01-30', role: 'Outreach Staff',   notes: 'Bilingual support was essential. Very effective.' },
      { eventName: 'Pediatric Immunization Drive',     date: '2025-12-15', role: 'Childcare Support', notes: 'Kept kids calm and parents at ease during a stressful process.' }
    ],
    notes: 'On planned leave through Mar 27. Highly versatile across all age groups. Strong Spanish-English bilingual capability.'
  },
  {
    id: 'STF-007',
    name: 'Rachel Park',
    avatar: 'RP',
    status: 'Available',
    title: 'Wellness Educator',
    skills: ['translation', 'school events', 'community outreach'],
    languages: ['English', 'Korean'],
    overallRating: 4.5,
    eventsWorked: 23,
    nextAvailable: 'Now',
    currentAssignment: null,
    phone: '801-555-0567',
    email: 'rachel.park@ihhealth.org',
    scenarioRatings: { childcare: 3, eldercare: 4, schoolEvents: 4, outreach: 4, behaviorSupport: 2, translation: 5 },
    eventHistory: [
      { eventName: 'Korean Community Health Fair',    date: '2026-03-08', role: 'Lead Translator',      notes: 'Critical asset — Korean translation made the event fully accessible.' },
      { eventName: 'Hillcrest High School Health Day', date: '2026-02-14', role: 'Health Educator',     notes: 'Teens responded well to her warm, direct communication style.' },
      { eventName: 'Multicultural Senior Outreach',   date: '2026-01-10', role: 'Translator / Outreach', notes: 'Excellent Korean-English bridge for elderly attendees.' }
    ],
    notes: 'Essential for Korean-speaking community events. Calm, professional demeanor. Growing asset for school programs.'
  },
  {
    id: 'STF-008',
    name: 'Carlos Mendez',
    avatar: 'CM',
    status: 'Available',
    title: 'Outreach & Engagement Lead',
    skills: ['community outreach', 'behavior reinforcement', 'translation'],
    languages: ['English', 'Spanish'],
    overallRating: 4.6,
    eventsWorked: 45,
    nextAvailable: 'Now',
    currentAssignment: null,
    phone: '801-555-0689',
    email: 'carlos.mendez@ihhealth.org',
    scenarioRatings: { childcare: 3, eldercare: 3, schoolEvents: 3, outreach: 5, behaviorSupport: 4, translation: 5 },
    eventHistory: [
      { eventName: 'Southside Health Resource Day',    date: '2026-03-18', role: 'Outreach Lead',             notes: 'Highest community engagement numbers of the year.' },
      { eventName: 'Behavioral Health Awareness Fair', date: '2026-02-22', role: 'Behavior Support',           notes: 'Professional, compassionate, and highly effective.' },
      { eventName: 'Latino Health Summit',             date: '2026-01-28', role: 'Lead Coordinator/Translator', notes: 'Exceptional cultural competency and community relationships.' }
    ],
    notes: 'Top outreach performer on the team. Exceptional community relationships in Spanish-speaking neighborhoods. Very reliable.'
  }
];
