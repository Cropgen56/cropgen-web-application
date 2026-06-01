/** Farmer preferred languages — must match cropgen-server user.model.js enum */
export const FARMER_LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", label: "Assamese", native: "অসমীয়া" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "ne", label: "Nepali", native: "नेपाली" },
  { code: "kok", label: "Konkani", native: "कोंकणी" },
  { code: "mai", label: "Maithili", native: "मैथिली" },
  { code: "sd", label: "Sindhi", native: "سنڌي" },
  { code: "ks", label: "Kashmiri", native: "कॉशुर" },
  { code: "doi", label: "Dogri", native: "डोगरी" },
  { code: "brx", label: "Bodo", native: "बड़ो" },
  { code: "mni", label: "Manipuri", native: "মৈতৈলোন্" },
  { code: "sat", label: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "sa", label: "Sanskrit", native: "संस्कृतम्" },
];

const CODE_SET = new Set(FARMER_LANGUAGES.map((l) => l.code));

export function normalizeFarmerLanguage(code) {
  const c = String(code || "en").toLowerCase();
  return CODE_SET.has(c) ? c : "en";
}

export function getFarmerLanguageLabel(code) {
  const c = normalizeFarmerLanguage(code);
  const lang = FARMER_LANGUAGES.find((l) => l.code === c);
  if (!lang) return "English";
  return `${lang.label} — ${lang.native}`;
}

export const FARMER_LANGUAGE_OPTIONS = FARMER_LANGUAGES.map((lang) => ({
  value: lang.code,
  label: `${lang.label} — ${lang.native}`,
}));
