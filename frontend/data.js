// VanaCare catalogue navigation metadata. Live product inventory is fetched from MongoDB.
const SYSTEMS = [
  {
    "id": "homeo",
    "name": "Homeopathy",
    "icon": "🌿",
    "blurb": "Classical homeopathy catalogue"
  },
  {
    "id": "ayurveda",
    "name": "Ayurveda",
    "icon": "🪔",
    "blurb": "Traditional Ayurveda wellness catalogue"
  },
  {
    "id": "dental",
    "name": "Dental Care",
    "icon": "🦷",
    "blurb": "Oral and dental care essentials"
  },
  {
    "id": "surgery",
    "name": "Post-Surgery Care",
    "icon": "🏥",
    "blurb": "Recovery essentials and pharmacist-reviewed products"
  }
];
const CATEGORIES = [
  {
    "id": "digestive",
    "system": "homeo",
    "name": "Digestive Care",
    "icon": "🌿",
    "blurb": "Digestive wellness catalogue"
  },
  {
    "id": "respiratory",
    "system": "homeo",
    "name": "Respiratory & Cold",
    "icon": "🍃",
    "blurb": "Respiratory care catalogue"
  },
  {
    "id": "skin",
    "system": "homeo",
    "name": "Skin & Hair",
    "icon": "🌱",
    "blurb": "Skin and hair care catalogue"
  },
  {
    "id": "joint",
    "system": "homeo",
    "name": "Joint & Muscle",
    "icon": "🪷",
    "blurb": "Joint and muscle care catalogue"
  },
  {
    "id": "immunity",
    "system": "homeo",
    "name": "Immunity & Fatigue",
    "icon": "☘️",
    "blurb": "General wellness catalogue"
  },
  {
    "id": "mind",
    "system": "homeo",
    "name": "Stress & Sleep",
    "icon": "🍵",
    "blurb": "Stress and sleep wellness catalogue"
  },
  {
    "id": "women",
    "system": "homeo",
    "name": "Women's Health",
    "icon": "🌸",
    "blurb": "Women's wellness catalogue"
  },
  {
    "id": "child",
    "system": "homeo",
    "name": "Child Care",
    "icon": "🧸",
    "blurb": "Child care catalogue"
  },
  {
    "id": "ayur-digest",
    "system": "ayurveda",
    "name": "Digestive Wellness",
    "icon": "🌾",
    "blurb": "Traditional digestive wellness products"
  },
  {
    "id": "ayur-immunity",
    "system": "ayurveda",
    "name": "Immunity & Wellness",
    "icon": "🍯",
    "blurb": "Traditional wellness products"
  },
  {
    "id": "ayur-skin",
    "system": "ayurveda",
    "name": "Skin & Hair Care",
    "icon": "🌿",
    "blurb": "Herbal skin and hair care products"
  },
  {
    "id": "ayur-joint",
    "system": "ayurveda",
    "name": "Joint & Bone Care",
    "icon": "🦴",
    "blurb": "Joint and bone care products"
  },
  {
    "id": "ayur-stress",
    "system": "ayurveda",
    "name": "Stress & Sleep",
    "icon": "🍵",
    "blurb": "Wellness products"
  },
  {
    "id": "ayur-general",
    "system": "ayurveda",
    "name": "General Wellness",
    "icon": "🌱",
    "blurb": "Daily wellness products"
  },
  {
    "id": "ayur-respiratory",
    "system": "ayurveda",
    "name": "Respiratory Care",
    "icon": "🍃",
    "blurb": "Respiratory care products"
  },
  {
    "id": "ayur-women",
    "system": "ayurveda",
    "name": "Women's Wellness",
    "icon": "🌸",
    "blurb": "Women's wellness products"
  },
  {
    "id": "dental-pain",
    "system": "dental",
    "name": "Tooth Pain",
    "icon": "🦷",
    "blurb": "Dental care essentials"
  },
  {
    "id": "dental-hygiene",
    "system": "dental",
    "name": "Oral Hygiene",
    "icon": "🪥",
    "blurb": "Daily oral hygiene essentials"
  },
  {
    "id": "dental-gum",
    "system": "dental",
    "name": "Gum Care",
    "icon": "🩸",
    "blurb": "Gum care essentials"
  },
  {
    "id": "dental-sensitivity",
    "system": "dental",
    "name": "Tooth Sensitivity",
    "icon": "🦷",
    "blurb": "Sensitivity care products"
  },
  {
    "id": "dental-treatment",
    "system": "dental",
    "name": "Post-Dental Treatment",
    "icon": "🏥",
    "blurb": "Post-treatment dental essentials"
  },
  {
    "id": "dental-ulcer",
    "system": "dental",
    "name": "Mouth Ulcer Care",
    "icon": "💊",
    "blurb": "Oral care essentials"
  },
  {
    "id": "dental-recovery",
    "system": "dental",
    "name": "Dental Recovery",
    "icon": "🩺",
    "blurb": "Dental recovery essentials"
  },
  {
    "id": "cardiac",
    "system": "surgery",
    "name": "Cardiac Recovery",
    "icon": "❤️",
    "blurb": "Post-cardiac care products"
  },
  {
    "id": "diabetes",
    "system": "surgery",
    "name": "Diabetes Care",
    "icon": "🩸",
    "blurb": "Blood glucose monitoring and care supplies"
  },
  {
    "id": "bp",
    "system": "surgery",
    "name": "Blood Pressure",
    "icon": "💗",
    "blurb": "Blood pressure monitoring supplies"
  },
  {
    "id": "pain-wound",
    "system": "surgery",
    "name": "Pain & Wound Care",
    "icon": "🩹",
    "blurb": "Wound dressing and care supplies"
  },
  {
    "id": "surgery-recovery",
    "system": "surgery",
    "name": "Surgery Recovery",
    "icon": "🏥",
    "blurb": "Surgical recovery essentials"
  }
];
const STAGES = ['Placed','Confirmed','Pharmacy','Prescription','Preparing','Packed','Picked up','Out for delivery','Delivered'];
