// Static catalogue + nearby store data. In a real deployment this
// would come from a backend/database instead of a JS file.

const SYSTEMS = [
  { id: 'homeo', name: 'Homeopathy', icon: '🌿', blurb: 'Classical potencies — 30C, 200C and beyond' },
  { id: 'ayurveda', name: 'Ayurveda', icon: '🪔', blurb: 'BAMS-prescribed churna, tablets & oils' },
  { id: 'dental', name: 'Dental Care', icon: '🦷', blurb: 'BDS-prescribed oral care & pain relief' },
  { id: 'allopathy', name: 'Allopathy & Post-Surgery', icon: '💊', blurb: 'MBBS/MD-prescribed medicines — cardiac, diabetes, recovery care' },
];

const CATEGORIES = [
  // Homeopathy
  { id: 'digestive', system: 'homeo', name: 'Digestive Care', icon: '🌿', blurb: 'Acidity, indigestion, bloating' },
  { id: 'respiratory', system: 'homeo', name: 'Respiratory & Cold', icon: '🍃', blurb: 'Cough, cold, sinus, throat' },
  { id: 'skin', system: 'homeo', name: 'Skin & Hair', icon: '🌱', blurb: 'Allergies, acne, hair fall' },
  { id: 'joint', system: 'homeo', name: 'Joint & Muscle', icon: '🪷', blurb: 'Aches, sprains, stiffness' },
  { id: 'immunity', system: 'homeo', name: 'Immunity & Fatigue', icon: '☘️', blurb: 'Low energy, frequent illness' },
  { id: 'mind', system: 'homeo', name: 'Stress & Sleep', icon: '🍵', blurb: 'Anxiety, insomnia, headaches' },
  { id: 'women', system: 'homeo', name: "Women's Health", icon: '🌸', blurb: 'Cycle, hormonal balance' },
  { id: 'child', system: 'homeo', name: 'Child Care', icon: '🧸', blurb: 'Teething, colic, mild fevers' },
  // Ayurveda
  { id: 'ayur-digest', system: 'ayurveda', name: 'Digestion & Metabolism', icon: '🌾', blurb: 'Churna, vati for gut health' },
  { id: 'ayur-immunity', system: 'ayurveda', name: 'Immunity & Vitality', icon: '🍯', blurb: 'Rasayana, chyawanprash-type formulas' },
  { id: 'ayur-joint', system: 'ayurveda', name: 'Joint & Muscle Care', icon: '🛢️', blurb: 'Medicated oils, balms' },
  { id: 'ayur-skin', system: 'ayurveda', name: 'Skin & Hair', icon: '🌿', blurb: 'Herbal oils and pastes' },
  // Dental
  { id: 'dental-pain', system: 'dental', name: 'Pain & Sensitivity', icon: '🦷', blurb: 'Toothache, sensitivity relief' },
  { id: 'dental-gum', system: 'dental', name: 'Gum Care', icon: '🩸', blurb: 'Bleeding, swollen gums' },
  { id: 'dental-hygiene', system: 'dental', name: 'Oral Hygiene', icon: '🧴', blurb: 'Mouthwash, medicated paste' },
  // Allopathy / Post-Surgery
  { id: 'cardiac', system: 'allopathy', name: 'Cardiac Care', icon: '❤️', blurb: 'Post-bypass & angioplasty recovery medicines' },
  { id: 'diabetes', system: 'allopathy', name: 'Diabetes Management', icon: '🩸', blurb: 'Blood sugar control medicines' },
  { id: 'bp', system: 'allopathy', name: 'Blood Pressure', icon: '🫀', blurb: 'Hypertension management' },
  { id: 'pain-wound', system: 'allopathy', name: 'Pain & Wound Recovery', icon: '🩹', blurb: 'Post-operative pain relief & wound care' },
  { id: 'surgery-recovery', system: 'allopathy', name: 'General Surgery Recovery', icon: '🏥', blurb: 'Antibiotics, supplements for healing' },
];

const PRODUCTS = [
  // --- Homeopathy ---
  { id: 'p1', name: 'Nux Vomica', potency: '30C', system: 'homeo', category: 'digestive', price: 120, prescriptionOnly: false, desc: 'For acidity, overindulgence and a sluggish stomach.' },
  { id: 'p2', name: 'Carbo Veg', potency: '200C', system: 'homeo', category: 'digestive', price: 140, prescriptionOnly: false, desc: 'Eases bloating and sluggish digestion.' },
  { id: 'p3', name: 'Lycopodium', potency: '30C', system: 'homeo', category: 'digestive', price: 130, prescriptionOnly: false, desc: 'For gas, fullness and afternoon digestive discomfort.' },
  { id: 'p4', name: 'Aconite Napellus', potency: '30C', system: 'homeo', category: 'respiratory', price: 110, prescriptionOnly: false, desc: 'For a cold or cough that comes on suddenly.' },
  { id: 'p5', name: 'Bryonia Alba', potency: '30C', system: 'homeo', category: 'respiratory', price: 125, prescriptionOnly: false, desc: 'Dry, painful cough that worsens with movement.' },
  { id: 'p6', name: 'Allium Cepa', potency: '30C', system: 'homeo', category: 'respiratory', price: 115, prescriptionOnly: false, desc: 'Watery eyes and runny nose, classic cold symptoms.' },
  { id: 'p7', name: 'Rhus Tox', potency: '200C', system: 'homeo', category: 'joint', price: 150, prescriptionOnly: true, desc: 'Stiffness that eases with gentle movement.' },
  { id: 'p8', name: 'Arnica Montana', potency: '30C', system: 'homeo', category: 'joint', price: 135, prescriptionOnly: false, desc: 'Bruising, soreness and muscle strain.' },
  { id: 'p9', name: 'Ruta Graveolens', potency: '30C', system: 'homeo', category: 'joint', price: 140, prescriptionOnly: false, desc: 'For sprains around tendons and joints.' },
  { id: 'p10', name: 'Sulphur', potency: '30C', system: 'homeo', category: 'skin', price: 120, prescriptionOnly: true, desc: 'For itching, redness and skin irritation.' },
  { id: 'p11', name: 'Graphites', potency: '30C', system: 'homeo', category: 'skin', price: 130, prescriptionOnly: false, desc: 'Dry, cracked skin and mild eczema.' },
  { id: 'p12', name: 'Thuja Occidentalis', potency: '30C', system: 'homeo', category: 'skin', price: 145, prescriptionOnly: false, desc: 'Supports scalp health and hair thinning.' },
  { id: 'p13', name: 'Echinacea', potency: 'Q', system: 'homeo', category: 'immunity', price: 160, prescriptionOnly: false, desc: 'General immune support during weak spells.' },
  { id: 'p14', name: 'China Officinalis', potency: '30C', system: 'homeo', category: 'immunity', price: 130, prescriptionOnly: false, desc: 'For fatigue after illness or fluid loss.' },
  { id: 'p15', name: 'Kali Phos', potency: '6X', system: 'homeo', category: 'mind', price: 110, prescriptionOnly: false, desc: 'Nervous exhaustion and mild anxiety.' },
  { id: 'p16', name: 'Coffea Cruda', potency: '30C', system: 'homeo', category: 'mind', price: 120, prescriptionOnly: false, desc: 'A racing mind that won\'t let you sleep.' },
  { id: 'p17', name: 'Ignatia Amara', potency: '200C', system: 'homeo', category: 'mind', price: 150, prescriptionOnly: true, desc: 'Emotional stress and tension headaches.' },
  { id: 'p18', name: 'Pulsatilla', potency: '30C', system: 'homeo', category: 'women', price: 130, prescriptionOnly: false, desc: 'Supports hormonal and cycle-related discomfort.' },
  { id: 'p19', name: 'Sepia', potency: '200C', system: 'homeo', category: 'women', price: 150, prescriptionOnly: true, desc: 'For fatigue and mood tied to hormonal shifts.' },
  { id: 'p20', name: 'Chamomilla', potency: '30C', system: 'homeo', category: 'child', price: 115, prescriptionOnly: false, desc: 'Teething discomfort and irritability in babies.' },
  { id: 'p21', name: 'Colocynthis', potency: '30C', system: 'homeo', category: 'child', price: 120, prescriptionOnly: false, desc: 'Colic and cramping in infants.' },

  // --- Ayurveda (BAMS-prescribed) ---
  { id: 'a1', name: 'Hingvastak Churna', potency: '100g', system: 'ayurveda', category: 'ayur-digest', price: 90, prescriptionOnly: false, desc: 'Classic digestive powder for gas and bloating.' },
  { id: 'a2', name: 'Avipattikar Churna', potency: '100g', system: 'ayurveda', category: 'ayur-digest', price: 95, prescriptionOnly: false, desc: 'Balances acidity and supports regularity.' },
  { id: 'a3', name: 'Triphala Vati', potency: '60 tabs', system: 'ayurveda', category: 'ayur-digest', price: 110, prescriptionOnly: false, desc: 'Gentle daily digestion and detox support.' },
  { id: 'a4', name: 'Chyawanprash', potency: '500g', system: 'ayurveda', category: 'ayur-immunity', price: 320, prescriptionOnly: false, desc: 'Traditional rasayana for daily immunity.' },
  { id: 'a5', name: 'Ashwagandha Tablets', potency: '60 tabs', system: 'ayurveda', category: 'ayur-immunity', price: 210, prescriptionOnly: true, desc: 'Supports stamina and resilience to stress.' },
  { id: 'a6', name: 'Giloy Ghan Vati', potency: '60 tabs', system: 'ayurveda', category: 'ayur-immunity', price: 150, prescriptionOnly: false, desc: 'Immunity support during seasonal illness.' },
  { id: 'a7', name: 'Mahanarayan Oil', potency: '100ml', system: 'ayurveda', category: 'ayur-joint', price: 180, prescriptionOnly: false, desc: 'Warming massage oil for joint and muscle pain.' },
  { id: 'a8', name: 'Rumalaya Oil', potency: '100ml', system: 'ayurveda', category: 'ayur-joint', price: 165, prescriptionOnly: true, desc: 'For stiffness and mild inflammation.' },
  { id: 'a9', name: 'Bhringraj Hair Oil', potency: '100ml', system: 'ayurveda', category: 'ayur-skin', price: 175, prescriptionOnly: false, desc: 'Traditional oil for hair fall and scalp care.' },
  { id: 'a10', name: 'Neem Tulsi Face Pack', potency: '100g', system: 'ayurveda', category: 'ayur-skin', price: 140, prescriptionOnly: false, desc: 'Herbal pack for acne-prone skin.' },

  // --- Dental (BDS-prescribed) ---
  { id: 'd1', name: 'Clove Oil Dental Drops', potency: '10ml', system: 'dental', category: 'dental-pain', price: 85, prescriptionOnly: false, desc: 'Quick relief for a throbbing toothache.' },
  { id: 'd2', name: 'Sensodent Sensitivity Gel', potency: '40g', system: 'dental', category: 'dental-pain', price: 130, prescriptionOnly: false, desc: 'For sensitivity to hot and cold.' },
  { id: 'd3', name: 'Dentogesic Pain Tablets', potency: '10 tabs', system: 'dental', category: 'dental-pain', price: 95, prescriptionOnly: true, desc: 'Short-course pain relief after dental work.' },
  { id: 'd4', name: 'Hexigel Gum Gel', potency: '30g', system: 'dental', category: 'dental-gum', price: 110, prescriptionOnly: true, desc: 'For bleeding and inflamed gums.' },
  { id: 'd5', name: 'Chlorhexidine Mouthwash', potency: '200ml', system: 'dental', category: 'dental-gum', price: 145, prescriptionOnly: true, desc: 'Antiseptic rinse for gum infections.' },
  { id: 'd6', name: 'Herbal Antiseptic Mouthwash', potency: '200ml', system: 'dental', category: 'dental-hygiene', price: 120, prescriptionOnly: false, desc: 'Daily rinse for fresh breath and hygiene.' },
  { id: 'd7', name: 'Medicated Toothpaste', potency: '100g', system: 'dental', category: 'dental-hygiene', price: 95, prescriptionOnly: false, desc: 'Fluoride-free paste for sensitive gums.' },

  // --- Allopathy / Post-Surgery Care (MBBS/MD-prescribed) ---
  { id: 'al1', name: 'Ecosprin (Aspirin)', potency: '75mg', system: 'allopathy', category: 'cardiac', price: 25, prescriptionOnly: true, desc: 'Blood thinner commonly prescribed after bypass or angioplasty.' },
  { id: 'al2', name: 'Clopidogrel', potency: '75mg', system: 'allopathy', category: 'cardiac', price: 85, prescriptionOnly: true, desc: 'Prevents clot formation after cardiac stent or bypass surgery.' },
  { id: 'al3', name: 'Atorvastatin', potency: '20mg', system: 'allopathy', category: 'cardiac', price: 110, prescriptionOnly: true, desc: 'Cholesterol-lowering statin for post-cardiac recovery.' },
  { id: 'al4', name: 'Metoprolol', potency: '25mg', system: 'allopathy', category: 'cardiac', price: 65, prescriptionOnly: true, desc: 'Beta-blocker to manage heart rate after cardiac surgery.' },
  { id: 'al5', name: 'Metformin', potency: '500mg', system: 'allopathy', category: 'diabetes', price: 45, prescriptionOnly: true, desc: 'First-line medicine for blood sugar management.' },
  { id: 'al6', name: 'Glimepiride', potency: '2mg', system: 'allopathy', category: 'diabetes', price: 70, prescriptionOnly: true, desc: 'Helps control blood sugar levels in type 2 diabetes.' },
  { id: 'al7', name: 'Amlodipine', potency: '5mg', system: 'allopathy', category: 'bp', price: 55, prescriptionOnly: true, desc: 'Commonly prescribed for hypertension management.' },
  { id: 'al8', name: 'Telmisartan', potency: '40mg', system: 'allopathy', category: 'bp', price: 95, prescriptionOnly: true, desc: 'ARB medicine for blood pressure control.' },
  { id: 'al9', name: 'Tramadol', potency: '50mg', system: 'allopathy', category: 'pain-wound', price: 80, prescriptionOnly: true, desc: 'Short-course pain relief after major surgery.' },
  { id: 'al10', name: 'Povidone-Iodine Solution', potency: '100ml', system: 'allopathy', category: 'pain-wound', price: 60, prescriptionOnly: false, desc: 'Antiseptic solution for wound dressing.' },
  { id: 'al11', name: 'Amoxiclav', potency: '625mg', system: 'allopathy', category: 'surgery-recovery', price: 130, prescriptionOnly: true, desc: 'Broad-spectrum antibiotic for post-surgical infection prevention.' },
  { id: 'al12', name: 'Multivitamin & Zinc', potency: '30 tabs', system: 'allopathy', category: 'surgery-recovery', price: 150, prescriptionOnly: false, desc: 'Supports faster wound healing and recovery.' },
];

const STORES = [
  { name: 'YCM Medicine Mart, Sant Tukaram Nagar', distanceKm: 0.5, etaMin: 15 },
  { name: 'Vandana Medical Store, Sant Tukaram Nagar', distanceKm: 0.8, etaMin: 20 },
  { name: 'Rathod Medical, Sant Tukaram Nagar', distanceKm: 1.0, etaMin: 25 },
  { name: 'Mauli Medical, Sant Tukaram Nagar', distanceKm: 1.1, etaMin: 25 },
  { name: 'Vijay Medical & General Stores, Sant Tukaram Nagar', distanceKm: 0.7, etaMin: 18 },
];

function pickNearestStore() {
  return STORES[Math.floor(Math.random() * STORES.length)];
}
