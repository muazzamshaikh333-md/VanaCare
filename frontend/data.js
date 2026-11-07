<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> e600fa6 (Upgrade VanaCare with advanced healthcare features)
// VanaCare department and category navigation metadata.
const SYSTEMS = [
  {
    "id": "allopathy",
    "name": "Allopathy (MBBS)",
    "icon": "💊",
    "blurb": "Modern medicine catalogue"
  },
  {
<<<<<<< HEAD
=======
// VanaCare catalogue navigation metadata. Live product inventory is fetched from MongoDB.
const SYSTEMS = [
  {
>>>>>>> 5ec37430b6339a9f6bfb61718f1d486ee41dcf2d
=======
>>>>>>> e600fa6 (Upgrade VanaCare with advanced healthcare features)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> e600fa6 (Upgrade VanaCare with advanced healthcare features)
  },
  {
    "id": "physiotherapy",
    "name": "Physiotherapy",
    "icon": "🧑‍⚕️",
    "blurb": "Rehabilitation products and support"
  },
  {
    "id": "psychiatry",
    "name": "Psychiatry",
    "icon": "🧠",
    "blurb": "Mental wellness information and verified care"
  },
  {
    "id": "veterinary",
    "name": "Animal Healthcare",
    "icon": "🐾",
    "blurb": "Veterinary care for companion and farm animals"
<<<<<<< HEAD
=======
>>>>>>> 5ec37430b6339a9f6bfb61718f1d486ee41dcf2d
=======
>>>>>>> e600fa6 (Upgrade VanaCare with advanced healthcare features)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> e600fa6 (Upgrade VanaCare with advanced healthcare features)
  },
  {
    "id": "general-health",
    "system": "allopathy",
    "name": "General Health",
    "icon": "🩺",
    "blurb": "General Health products and information"
  },
  {
    "id": "fever-pain",
    "system": "allopathy",
    "name": "Fever & Pain Relief",
    "icon": "🌡️",
    "blurb": "Fever & Pain Relief products and information"
  },
  {
    "id": "cold-cough",
    "system": "allopathy",
    "name": "Cold & Cough",
    "icon": "🍃",
    "blurb": "Cold & Cough products and information"
  },
  {
    "id": "digestive-health",
    "system": "allopathy",
    "name": "Digestive Care",
    "icon": "🫖",
    "blurb": "Digestive Care products and information"
  },
  {
    "id": "diabetes-health",
    "system": "allopathy",
    "name": "Diabetes Care",
    "icon": "🩸",
    "blurb": "Diabetes Care products and information"
  },
  {
    "id": "heart-bp",
    "system": "allopathy",
    "name": "Heart & Blood Pressure",
    "icon": "❤️",
    "blurb": "Heart & Blood Pressure products and information"
  },
  {
    "id": "respiratory-health",
    "system": "allopathy",
    "name": "Respiratory Care",
    "icon": "🫁",
    "blurb": "Respiratory Care products and information"
  },
  {
    "id": "skin-health",
    "system": "allopathy",
    "name": "Skin Care",
    "icon": "🧴",
    "blurb": "Skin Care products and information"
  },
  {
    "id": "eye-ear",
    "system": "allopathy",
    "name": "Eye & Ear Care",
    "icon": "👁️",
    "blurb": "Eye & Ear Care products and information"
  },
  {
    "id": "vitamins",
    "system": "allopathy",
    "name": "Vitamins & Supplements",
    "icon": "🍊",
    "blurb": "Vitamins & Supplements products and information"
  },
  {
    "id": "first-aid",
    "system": "allopathy",
    "name": "First Aid",
    "icon": "🩹",
    "blurb": "First Aid products and information"
  },
  {
    "id": "womens-health",
    "system": "allopathy",
    "name": "Women's Healthcare",
    "icon": "🌸",
    "blurb": "Women's Healthcare products and information"
  },
  {
    "id": "child-health",
    "system": "allopathy",
    "name": "Child Healthcare",
    "icon": "🧸",
    "blurb": "Child Healthcare products and information"
  },
  {
    "id": "back-spine",
    "system": "physiotherapy",
    "name": "Back & Spine Care",
    "icon": "🦴",
    "blurb": "Back & Spine Care products and information"
  },
  {
    "id": "neck-shoulder",
    "system": "physiotherapy",
    "name": "Neck & Shoulder Care",
    "icon": "💪",
    "blurb": "Neck & Shoulder Care products and information"
  },
  {
    "id": "knee-joint",
    "system": "physiotherapy",
    "name": "Knee & Joint Rehabilitation",
    "icon": "🦵",
    "blurb": "Knee & Joint Rehabilitation products and information"
  },
  {
    "id": "sports-injury",
    "system": "physiotherapy",
    "name": "Sports Injury Rehabilitation",
    "icon": "🏃",
    "blurb": "Sports Injury Rehabilitation products and information"
  },
  {
    "id": "post-op-rehab",
    "system": "physiotherapy",
    "name": "Post-Surgery Rehabilitation",
    "icon": "🏥",
    "blurb": "Post-Surgery Rehabilitation products and information"
  },
  {
    "id": "muscle-recovery",
    "system": "physiotherapy",
    "name": "Muscle Recovery",
    "icon": "💪",
    "blurb": "Muscle Recovery products and information"
  },
  {
    "id": "mobility-support",
    "system": "physiotherapy",
    "name": "Mobility & Support",
    "icon": "🦯",
    "blurb": "Mobility & Support products and information"
  },
  {
    "id": "physio-equipment",
    "system": "physiotherapy",
    "name": "Home Physiotherapy Equipment",
    "icon": "⚙️",
    "blurb": "Home Physiotherapy Equipment products and information"
  },
  {
    "id": "mental-wellness",
    "system": "psychiatry",
    "name": "Mental Wellness Information",
    "icon": "🧠",
    "blurb": "Mental Wellness Information products and information"
  },
  {
    "id": "stress-support",
    "system": "psychiatry",
    "name": "Anxiety & Stress Support",
    "icon": "🌿",
    "blurb": "Anxiety & Stress Support products and information"
  },
  {
    "id": "sleep-health",
    "system": "psychiatry",
    "name": "Sleep Health",
    "icon": "🌙",
    "blurb": "Sleep Health products and information"
  },
  {
    "id": "depression-info",
    "system": "psychiatry",
    "name": "Depression Care Information",
    "icon": "💚",
    "blurb": "Depression Care Information products and information"
  },
  {
    "id": "psychiatrist-consult",
    "system": "psychiatry",
    "name": "Psychiatric Consultation",
    "icon": "👩‍⚕️",
    "blurb": "Psychiatric Consultation products and information"
  },
  {
    "id": "rx-mental-health",
    "system": "psychiatry",
    "name": "Prescription-Based Mental Healthcare",
    "icon": "📋",
    "blurb": "Prescription-Based Mental Healthcare products and information"
  },
  {
    "id": "dog-healthcare",
    "system": "veterinary",
    "name": "Dog Healthcare",
    "icon": "🐕",
    "blurb": "Dog Healthcare products and information"
  },
  {
    "id": "cat-healthcare",
    "system": "veterinary",
    "name": "Cat Healthcare",
    "icon": "🐈",
    "blurb": "Cat Healthcare products and information"
  },
  {
    "id": "bird-healthcare",
    "system": "veterinary",
    "name": "Bird Healthcare",
    "icon": "🐦",
    "blurb": "Bird Healthcare products and information"
  },
  {
    "id": "livestock-healthcare",
    "system": "veterinary",
    "name": "Livestock Healthcare",
    "icon": "🐄",
    "blurb": "Livestock Healthcare products and information"
  },
  {
    "id": "pet-nutrition",
    "system": "veterinary",
    "name": "Pet Nutrition",
    "icon": "🥣",
    "blurb": "Pet Nutrition products and information"
  },
  {
    "id": "vet-general",
    "system": "veterinary",
    "name": "Veterinary General Care",
    "icon": "🐾",
    "blurb": "Veterinary General Care products and information"
  },
  {
    "id": "pet-skin-coat",
    "system": "veterinary",
    "name": "Pet Skin & Coat Care",
    "icon": "🧴",
    "blurb": "Pet Skin & Coat Care products and information"
  },
  {
    "id": "pet-dental",
    "system": "veterinary",
    "name": "Pet Dental Care",
    "icon": "🦷",
    "blurb": "Pet Dental Care products and information"
  },
  {
    "id": "pet-vaccination",
    "system": "veterinary",
    "name": "Pet Vaccination Information",
    "icon": "💉",
    "blurb": "Pet Vaccination Information products and information"
  },
  {
    "id": "pet-first-aid",
    "system": "veterinary",
    "name": "Pet First Aid & Emergency Care",
    "icon": "🩹",
    "blurb": "Pet First Aid & Emergency Care products and information"
<<<<<<< HEAD
=======
>>>>>>> 5ec37430b6339a9f6bfb61718f1d486ee41dcf2d
=======
>>>>>>> e600fa6 (Upgrade VanaCare with advanced healthcare features)
  }
];
const STAGES = ['Placed','Confirmed','Pharmacy','Prescription','Preparing','Packed','Picked up','Out for delivery','Delivered'];
