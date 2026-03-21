/* =============================================
   Provider / Vendor Data
   Linked to asset categories for resupply & mass buying
   ============================================= */

const PROVIDERS = [
  {
    category: 'Printed Materials',
    icon: '📄',
    color: '#eff6ff',
    lowStockThreshold: 700,
    providers: [
      { name: 'Utah Printing Co.', phone: '(801) 555-0192', specialty: 'Bulk health brochures & flyers', turnaround: '3–5 days', minOrder: '500 units' },
      { name: 'HealthPrint Supplies', phone: '(888) 555-0341', specialty: 'Bilingual materials & large format', turnaround: '5–7 days', minOrder: '250 units' },
      { name: 'MedEd Print Solutions', phone: '(801) 555-0278', specialty: 'Medical-grade pamphlets & guides', turnaround: '2–4 days', minOrder: '100 units' }
    ]
  },
  {
    category: 'Giveaway Kits',
    icon: '🎁',
    color: '#f0fdf4',
    lowStockThreshold: 175,
    providers: [
      { name: 'CommunityKit Wholesale', phone: '(801) 555-0415', specialty: 'Wellness & activity kits, adult & youth', turnaround: '7–10 days', minOrder: '50 kits' },
      { name: 'HealthFirst Distributors', phone: '(888) 555-0523', specialty: 'Senior & family health packages', turnaround: '5–8 days', minOrder: '25 kits' }
    ]
  },
  {
    category: 'Display & Signage',
    icon: '🪧',
    color: '#fef3c7',
    lowStockThreshold: 7,
    providers: [
      { name: 'BannerWorld Utah', phone: '(801) 555-0634', specialty: 'Pop-up banners & retractable stands', turnaround: '4–6 days', minOrder: '2 units' },
      { name: 'SignCraft Pro', phone: '(888) 555-0712', specialty: 'Vinyl signs, table runners, branded displays', turnaround: '3–5 days', minOrder: '5 units' }
    ]
  },
  {
    category: 'Tables & Furniture',
    icon: '🪑',
    color: '#f3e8ff',
    lowStockThreshold: 5,
    providers: [
      { name: 'EventFurnish Direct', phone: '(801) 555-0819', specialty: 'Folding tables, chairs & canopies', turnaround: '2–3 days', minOrder: '2 units' },
      { name: 'Party & Event Supply Co.', phone: '(888) 555-0924', specialty: 'Branded table skirts & outdoor event furniture', turnaround: '3–5 days', minOrder: '1 unit' }
    ]
  },
  {
    category: 'AV Equipment',
    icon: '🔊',
    color: '#cffafe',
    lowStockThreshold: 3,
    providers: [
      { name: 'SoundTech Rentals & Sales', phone: '(801) 555-1031', specialty: 'PA systems, wireless mics & projectors', turnaround: '1–2 days', minOrder: '1 unit' },
      { name: 'AV Solutions Utah', phone: '(801) 555-1148', specialty: 'Presentation laptops, screens & AV gear', turnaround: '2–4 days', minOrder: '1 unit' }
    ]
  },
  {
    category: 'Screening Supplies',
    icon: '🩺',
    color: '#fee2e2',
    lowStockThreshold: 5,
    providers: [
      { name: 'MedSupply Direct', phone: '(888) 555-1256', specialty: 'Blood pressure cuffs, glucose monitors & BMI scales', turnaround: '3–5 days', minOrder: '2 units' },
      { name: 'HealthScreen Partners', phone: '(801) 555-1372', specialty: 'Disposable medical supplies & screening charts', turnaround: '2–3 days', minOrder: '10 units' },
      { name: 'Intermountain Medical Supply', phone: '(801) 555-1489', specialty: 'Full-range clinical screening equipment', turnaround: '1–2 days', minOrder: '1 unit' }
    ]
  },
  {
    category: 'Educational Toolkits',
    icon: '📚',
    color: '#e0e7ff',
    lowStockThreshold: 18,
    providers: [
      { name: 'HealthEd Resources', phone: '(888) 555-1597', specialty: 'Heart health, diabetes prevention & wellness toolkits', turnaround: '5–7 days', minOrder: '10 kits' },
      { name: 'Community Wellness Supply', phone: '(801) 555-1614', specialty: 'Mental health, nutrition & senior health kits', turnaround: '7–10 days', minOrder: '5 kits' }
    ]
  }
];
