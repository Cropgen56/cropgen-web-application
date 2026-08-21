/** Farmer preferred languages — match biodrops-web-application + cropgen-server user.model.js enum */
export const FARMER_LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "as", label: "Assamese", native: "অসমীয়া" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "brx", label: "Bodo", native: "बड़ो" },
  { code: "doi", label: "Dogri", native: "डोगरी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ks", label: "Kashmiri", native: "کٲشُر" },
  { code: "kok", label: "Konkani", native: "कोंकणी" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "mni", label: "Manipuri (Meitei)", native: "মৈতৈলোন্" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "mai", label: "Maithili", native: "मैथिली" },
  { code: "ne", label: "Nepali", native: "नेपाली" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "sa", label: "Sanskrit", native: "संस्कृतम्" },
  { code: "sat", label: "Santhali", native: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "sd", label: "Sindhi", native: "سنڌي" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "ur", label: "Urdu", native: "اردو" },
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
