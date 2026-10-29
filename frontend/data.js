// Display-only metadata for the three compartments and their categories —
// icons, labels, blurbs. The medicines themselves, and the stores, now come
// from the backend (see api.js) instead of living here.

const SYSTEMS = [
  { id: 'homeo', name: 'Homeopathy', icon: '🌿', blurb: 'Classical potencies — 30C, 200C and beyond' },
  { id: 'ayurveda', name: 'Ayurveda', icon: '🪔', blurb: 'BAMS-prescribed churna, tablets & oils' },
  { id: 'dental', name: 'Dental Care', icon: '🦷', blurb: 'BDS-prescribed oral care & pain relief' },
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
];

// Order tracking stages — must match backend/config/orderStages.js exactly.
const STAGES = ['Placed', 'Accepted by partner', 'Picked up', 'Out for delivery', 'Delivered'];
