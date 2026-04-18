import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  sendotp,
  verifyuserotp,
  sendWhatsappOtpThunk,
  verifyWhatsappOtpThunk,
  resendWhatsappOtpThunk,
  completeProfile,
} from "../../../redux/slices/authSlice";
import SocialButtons from "../shared/socialbuttons/SocialButton";
import tick from "../../../assets/logo/tick2.svg";
import { message } from "antd";
import {
  APP_LOGO_URL,
  APP_NAME,
  DEFAULT_ORGANIZATION_CODE,
} from "../../../config/brand";
import { getCountries, getLanguages } from "../../../api/locationApi";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Clipboard,
  FileText,
  Globe,
  History,
  Info,
  Languages,
  Lock,
  MessageCircle,
} from "lucide-react";

const phoneOk = (v) => /^\+\d{10,12}$/.test(String(v).trim());
const digitsOnly = (v) => String(v || "").replace(/\D/g, "");
const normalizeDialCode = (v) => digitsOnly(v).slice(0, 4);
const buildE164 = (dialCode, localNumber) =>
  `+${normalizeDialCode(dialCode)}${digitsOnly(localNumber)}`;

const datasetByIso2 = new Map();

const ONBOARDING_KEY = "cropgen_signup_onboarding";

const PRIMARY = "#0D4D44";
const BORDER_GREEN = "#2E7D32";
const INFO_BG = "#E8F5E9";

const FALLBACK_LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
];

const iso2ToFlagCdn = (iso2) => {
  const code = String(iso2 || "").toLowerCase();
  if (!/^[a-z]{2}$/.test(code)) return "";
  return `https://flagcdn.com/w20/${code}.png`;
};

const LANG_ICONS = [
  Languages,
  MessageCircle,
  FileText,
  BookOpen,
  MessageCircle,
];

function readOnboarding() {
  try {
    const raw = sessionStorage.getItem(ONBOARDING_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeOnboarding(patch) {
  const cur = readOnboarding();
  sessionStorage.setItem(ONBOARDING_KEY, JSON.stringify({ ...cur, ...patch }));
}

function clearOnboarding() {
  sessionStorage.removeItem(ONBOARDING_KEY);
}

function normalizeLanguages(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return FALLBACK_LANGUAGES;
  return raw.map((item, i) => {
    if (typeof item === "string") {
      return { code: item, label: item, native: item };
    }
    const code = item.code || item.iso || item.iso2 || item.id || String(i);
    const label = item.name || item.englishName || item.label || code;
    const native = item.nativeName || item.native || item.name || label;
    return { code: String(code), label, native };
  });
}

function StepHeader({ current, total }) {
  const pct = (current / total) * 100;
  return (
    <div className="mb-4 flex w-full items-center gap-2.5 sm:mb-6 sm:gap-3">
      <span className="whitespace-nowrap text-[11px] font-semibold text-gray-500 sm:text-sm">
        Step {current} of {total}
      </span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: PRIMARY }}
        />
      </div>
    </div>
  );
}

function AuthCard({ children, className = "", style }) {
  return (
    <div
      className={`w-full max-w-[420px] rounded-3xl border-2 bg-white px-5 py-6 shadow-[0_12px_40px_rgba(13,77,68,0.08)] sm:px-8 sm:py-9 lg:px-10 lg:py-10 ${className}`}
      style={{ borderColor: `${BORDER_GREEN}99`, ...style }}
    >
      {children}
    </div>
  );
}

function BrandMark({ className = "" }) {
  return (
    <div
      className={`mx-auto flex items-center justify-center gap-2 ${className}`}
    >
      <img
        src={APP_LOGO_URL}
        alt={`${APP_NAME} logo`}
        className="h-9 w-auto object-contain sm:h-10"
      />
      <span
        className="text-[1.95rem] font-bold tracking-tight sm:text-2xl"
        style={{ color: PRIMARY }}
      >
        {APP_NAME}
      </span>
    </div>
  );
}

const SignupLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { onboardingRequired } = useSelector((state) => state.auth);

  const isLogin = location.pathname === "/login";
  const isSignupCountry = location.pathname === "/signup";
  const isSignupLanguage = location.pathname === "/signup/language";
  const isSignupAccount = location.pathname === "/signup/account";

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [completingProfile, setCompletingProfile] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [orgCodeError, setOrgCodeError] = useState("");
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dialCode: "91",
    phoneLocal: "",
    phone: "",
    otp: "",
    terms: true,
    whatsappConsent: false,
    country: "IN",
  });
  const [countries, setCountries] = useState([]);

  const [languages, setLanguages] = useState(FALLBACK_LANGUAGES);
  const [languagesLoading, setLanguagesLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const [otpInputs, setOtpInputs] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);

  const normalizedCountries = useMemo(
    () =>
      countries.map((c) => {
        const iso2 = String(c.iso2 || "").toUpperCase();
        const ref = datasetByIso2.get(iso2);
        const dialCode = normalizeDialCode(
          c.phonecode ||
            c.phoneCode ||
            c.callingCode ||
            c.dialCode ||
            ref?.dialCode ||
            "",
        );
        return {
          ...c,
          iso2,
          flagEmoji: c.flag_emoji || c.flag || ref?.flag || "",
          flagUrl: c.flagUrl || c.flag_url || iso2ToFlagCdn(iso2),
          dialCode,
          name: c.name || ref?.name || iso2,
        };
      }),
    [countries],
  );

  useEffect(() => {
    if (isSignupLanguage && !readOnboarding().country) {
      navigate("/signup", { replace: true });
    }
  }, [isSignupLanguage, navigate]);

  useEffect(() => {
    if (isSignupAccount && !readOnboarding().language) {
      navigate("/signup/language", { replace: true });
    }
  }, [isSignupAccount, navigate]);

  useEffect(() => {
    if (!isLogin) return;
    setStep(1);
    setOtpVerified(false);
    setOtpInputs(Array(6).fill(""));
    setOrgCodeError("");
    setFormData((prev) => ({
      ...prev,
      country: "IN",
      dialCode: "91",
      phoneLocal: "",
      phone: "",
      otp: "",
    }));
  }, [isLogin, location.pathname]);

  useEffect(() => {
    if (!isSignupAccount) return;
    const d = readOnboarding();
    if (d.country) {
      setFormData((prev) => ({ ...prev, country: d.country }));
    }
    setStep(1);
    setOtpVerified(false);
    setOtpInputs(Array(6).fill(""));
    setFormData((prev) => ({ ...prev, otp: "" }));
    setOrgCodeError("");
  }, [isSignupAccount, location.pathname]);

  useEffect(() => {
    if (!isSignupCountry && !isSignupAccount && !isLogin) return;
    let active = true;
    getCountries()
      .then((data) => {
        if (active) setCountries(Array.isArray(data) ? data : []);
      })
      .catch(() => message.error("Unable to load countries."));
    return () => {
      active = false;
    };
  }, [isSignupCountry]);

  useEffect(() => {
    if (!isSignupAccount) return;
    if (!countries.length) return;
    const d = readOnboarding();
    if (!d.country) return;
    const selected = normalizedCountries.find(
      (c) => String(c.iso2).toUpperCase() === String(d.country).toUpperCase(),
    );
    if (!selected) return;
    const code = normalizeDialCode(
      selected.dialCode ||
        selected.phonecode ||
        selected.phoneCode ||
        selected.callingCode ||
        selected.dialCode ||
        "91",
    );
    if (!code) return;
    setFormData((prev) => ({ ...prev, dialCode: code }));
  }, [normalizedCountries, isSignupAccount]);

  useEffect(() => {
    if (!isSignupLanguage) return;
    let active = true;
    setLanguagesLoading(true);
    getLanguages()
      .then((data) => {
        if (!active) return;
        const normalized = normalizeLanguages(data);
        setLanguages(normalized);
        const d = readOnboarding();
        if (d.language && normalized.some((l) => l.code === d.language)) {
          setSelectedLanguage(d.language);
        } else if (normalized.length) {
          setSelectedLanguage(normalized[0].code);
        }
      })
      .catch(() => {
        if (active) {
          setLanguages(FALLBACK_LANGUAGES);
          setSelectedLanguage("en");
          message.warning("Using default language list (API unavailable).");
        }
      })
      .finally(() => {
        if (active) setLanguagesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isSignupLanguage]);

  const countryOptions = normalizedCountries.map((c) => ({
    label: `${c.name}${c.dialCode ? ` (+${c.dialCode})` : ""}`,
    value: c.iso2,
    flagUrl: c.flagUrl,
  }));

  const countryDialOptions = normalizedCountries
    .filter((c) => c.dialCode)
    .map((c) => ({
      value: c.dialCode,
      label: `+${c.dialCode}`,
      flagUrl: c.flagUrl,
    }));

  const handleOtpChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otpInputs];
      newOtp[index] = value;
      setOtpInputs(newOtp);
      setFormData((prev) => ({ ...prev, otp: newOtp.join("") }));
      if (value && index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpInputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && formData.otp.length === 6) {
      handleVerifyOtp();
    }
  };

  /** Stops Enter / mobile keyboard "Go" from firing the first button or implicit submit while typing. */
  const handlePhoneFieldKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleSendOtp = () => {
    const fn = formData.firstName.trim();
    const ln = formData.lastName.trim();
    const phone = buildE164(formData.dialCode, formData.phoneLocal);
    const onboarding = readOnboarding();
    const lang = onboarding.language || selectedLanguage || "en";

    if (isSignupAccount) {
      if (!fn) return message.error("Please enter your first name");
      if (!ln) return message.error("Please enter your last name");
      if (!digitsOnly(formData.phoneLocal))
        return message.error("Please enter your phone number");
      if (!normalizeDialCode(formData.dialCode))
        return message.error("Please select a country code");
      if (!phoneOk(phone))
        return message.error("Please enter a valid phone number");
      if (!formData.country) return message.error("Please select your country");
    } else {
      if (!digitsOnly(formData.phoneLocal))
        return message.error("Please enter your phone number");
      if (!normalizeDialCode(formData.dialCode))
        return message.error("Please select a country code");
      if (!phoneOk(phone))
        return message.error("Please enter a valid phone number");
    }

    setSendingOtp(true);
    dispatch(
      sendWhatsappOtpThunk({
        phone,
        language: lang,
        country: formData.country,
        firstName: fn,
        lastName: ln,
        signupIntent: isSignupAccount,
      }),
    ).then((res) => {
      setSendingOtp(false);
      if (res.meta.requestStatus === "fulfilled") {
        setFormData((prev) => ({ ...prev, phone }));
        setStep(2);
      } else {
        const err = res.payload;
        message.error(
          typeof err === "string" ? err : err?.message || "Failed to send OTP",
        );
      }
    });
  };

  const handleVerifyOtp = () => {
    if (!formData.otp || formData.otp.length !== 6)
      return message.error("Enter a valid 6-digit OTP");

    setVerifyingOtp(true);
    dispatch(
      verifyWhatsappOtpThunk({
        phone: formData.phone,
        otp: formData.otp,
      }),
    ).then((res) => {
      setVerifyingOtp(false);
      if (res.meta.requestStatus === "fulfilled") {
        setOtpVerified(true);
        if (res.payload && res.payload.onboardingRequired === false) {
          clearOnboarding();
          navigate("/cropgen-analytics");
        } else {
          setStep(3);
        }
      } else {
        message.error(res.payload?.message || "OTP verification failed");
      }
    });
  };

  const handleCompleteProfile = () => {
    const fn = formData.firstName.trim();
    const ln = formData.lastName.trim();
    if (!fn || !ln) {
      setOrgCodeError("Please enter your first and last name.");
      return;
    }
    if (!formData.terms) {
      setOrgCodeError("You must accept Terms & Conditions");
      return;
    }
    if (!formData.country) {
      setOrgCodeError("Please select country.");
      return;
    }
    setOrgCodeError("");
    // #region agent log
    fetch("http://127.0.0.1:7816/ingest/2f2e2976-5f6e-4ec5-a3c9-5521133e72c2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "304cd3",
      },
      body: JSON.stringify({
        sessionId: "304cd3",
        runId: "signup-profile-debug",
        hypothesisId: "H1",
        location: "SignupLogin.jsx:handleCompleteProfile:beforeDispatch",
        message: "Submitting complete profile payload from signup UI",
        data: {
          hasFirstName: Boolean(fn),
          firstNameLength: fn.length,
          hasLastName: Boolean(ln),
          lastNameLength: ln.length,
          hasPhone: Boolean(formData.phone),
          hasCountry: Boolean(formData.country),
          hasLanguage: Boolean(readOnboarding().language || selectedLanguage),
          termsAccepted: formData.terms === true,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    setCompletingProfile(true);
    const onboarding = readOnboarding();
    dispatch(
      completeProfile({
        terms: true,
        organizationCode: DEFAULT_ORGANIZATION_CODE,
        firstName: fn,
        lastName: ln,
        phone: formData.phone,
        language: onboarding.language || selectedLanguage || "en",
        country: formData.country,
      }),
    ).then((res) => {
      setCompletingProfile(false);
      // #region agent log
      fetch("http://127.0.0.1:7816/ingest/2f2e2976-5f6e-4ec5-a3c9-5521133e72c2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "304cd3",
        },
        body: JSON.stringify({
          sessionId: "304cd3",
          runId: "signup-profile-debug",
          hypothesisId: "H4",
          location: "SignupLogin.jsx:handleCompleteProfile:afterDispatch",
          message: "Complete profile dispatch resolved",
          data: {
            requestStatus: res?.meta?.requestStatus || null,
            responseMessage: res?.payload?.message || res?.payload || null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (res.meta.requestStatus === "fulfilled") {
        clearOnboarding();
        message.success("Profile completed!");
        navigate("/cropgen-analytics");
      } else {
        const errMessage = String(
          res.payload?.message || "Profile completion failed",
        );
        // Idempotent UX: user may already be onboarded in another tab/session.
        if (/profile already completed/i.test(errMessage)) {
          clearOnboarding();
          message.success("Profile already completed. Redirecting...");
          navigate("/cropgen-analytics");
          return;
        }
        setOrgCodeError(errMessage);
      }
    });
  };

  useEffect(() => {
    setOtpVerified(false);
    setOrgCodeError("");
  }, [formData.phone]);

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(paste)) {
      const digits = paste.split("");
      setOtpInputs(digits);
      setFormData((prev) => ({ ...prev, otp: paste }));
      inputRefs.current[5]?.focus();
    }
  };

  const translateY = `${-(step - 1) * 100}%`;

  const needsNameOnStep3 =
    isSignupAccount &&
    step === 3 &&
    (!formData.firstName.trim() || !formData.lastName.trim());

  const goCountryContinue = () => {
    if (!formData.country) {
      message.error("Please select your country");
      return;
    }
    const label =
      countryOptions.find((c) => c.value === formData.country)?.label || "";
    const selected = normalizedCountries.find(
      (c) =>
        String(c.iso2).toUpperCase() === String(formData.country).toUpperCase(),
    );
    const dialCode = normalizeDialCode(
      selected?.dialCode ||
        selected?.phonecode ||
        selected?.phoneCode ||
        selected?.callingCode ||
        selected?.dialCode ||
        "91",
    );
    setFormData((prev) => ({ ...prev, dialCode: dialCode || prev.dialCode }));
    writeOnboarding({
      country: formData.country,
      countryLabel: label,
      dialCode: dialCode || formData.dialCode,
    });
    navigate("/signup/language");
  };

  const goLanguageContinue = () => {
    if (!selectedLanguage) {
      message.error("Please choose a language");
      return;
    }
    const lang = languages.find((l) => l.code === selectedLanguage);
    writeOnboarding({
      language: selectedLanguage,
      languageLabel: lang?.label || selectedLanguage,
    });
    navigate("/signup/account");
  };

  if (isSignupCountry) {
    return (
      <div className="flex min-h-full w-full flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
        <AuthCard>
          <BrandMark className="mb-6" />
          <h2
            className="text-center text-xl font-bold sm:text-2xl"
            style={{ color: PRIMARY }}
          >
            Select Your Country
          </h2>
          <p className="mt-2 text-center text-sm leading-relaxed text-[#666666]">
            Help us tailor insights based on your location and regional climate
            data.
          </p>
          <label className="mb-2 mt-6 block text-left text-[11px] font-bold uppercase tracking-widest text-gray-500">
            Your location
          </label>
          <div className="relative mb-5">
            <Globe
              className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-gray-400"
              aria-hidden
            />
            <AuthAutocompleteDropdown
              value={formData.country}
              onChange={(countryValue) =>
                setFormData((prev) => ({
                  ...prev,
                  country: countryValue,
                }))
              }
              options={countryOptions}
              placeholder="Search your country..."
              inputClassName="w-full h-12 rounded-xl border border-gray-200 bg-[#F2F2F2] pl-11 pr-10 text-sm font-medium text-gray-900 outline-none transition-shadow placeholder:text-gray-500 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#0D4D44]/20"
            />
          </div>
          <div
            className="mb-6 flex gap-3 rounded-xl border px-4 py-3 text-sm leading-snug text-[#666666]"
            style={{
              backgroundColor: INFO_BG,
              borderColor: `${BORDER_GREEN}55`,
            }}
          >
            <Info
              className="mt-0.5 h-5 w-5 shrink-0"
              style={{ color: PRIMARY }}
              strokeWidth={2}
            />
            <p style={{ color: PRIMARY }}>
              Regional selection optimizes our neural models for your specific
              soil type and seasonal variances.
            </p>
          </div>
          <button
            type="button"
            onClick={goCountryContinue}
            className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-base font-bold text-white shadow-[0_6px_20px_rgba(13,77,68,0.35)] transition hover:opacity-95"
            style={{ backgroundColor: PRIMARY }}
          >
            Continue
            <ArrowRight className="h-5 w-5" aria-hidden />
          </button>
          <p className="mt-6 text-center text-sm text-[#666666]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold hover:underline"
              style={{ color: PRIMARY }}
            >
              Log in
            </Link>
          </p>
        </AuthCard>
      </div>
    );
  }

  if (isSignupLanguage) {
    return (
      <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-3 py-2 sm:px-6 sm:py-4">
        <AuthCard
          className="flex max-h-[calc(100dvh-1rem)] w-full max-w-[430px] flex-col overflow-hidden rounded-[24px] border bg-white px-4 py-4 shadow-[0_16px_46px_rgba(0,0,0,0.08)] sm:max-h-[calc(100dvh-2rem)] sm:rounded-[28px] sm:px-6 sm:py-5 lg:px-7 lg:py-6"
          style={{ borderColor: "#E5E7EB" }}
        >
          <StepHeader current={2} total={3} />
          <div className="mb-2 flex items-start gap-3 sm:mb-3">
            <BrandMark />
          </div>
          <h2
            className="text-[2rem] leading-[0.95] font-bold tracking-tight sm:text-[2.25rem] lg:text-[2.5rem]"
            style={{ color: PRIMARY }}
          >
            Choose Your Language
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-gray-500 sm:text-[13px]">
            Select a language you&apos;re comfortable with
          </p>
          <div className="mt-2.5 min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5 sm:mt-3 sm:pr-1">
            {languagesLoading ? (
              <p className="py-8 text-center text-sm text-gray-500">
                Loading languages…
              </p>
            ) : (
              languages.map((lang, idx) => {
                const Icon = LANG_ICONS[idx % LANG_ICONS.length];
                const selected = selectedLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`flex w-full items-center gap-2.5 rounded-2xl border px-2.5 py-2 text-left transition sm:gap-3 sm:px-3 sm:py-2.5 ${
                      selected
                        ? "border-[#0D4D44] bg-[#DCE9E5]"
                        : "border-[#E5E7EB] bg-[#F6F7F5] hover:border-gray-300"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${
                        selected
                          ? "bg-[#BFD6D0] text-[#0D4D44]"
                          : "bg-[#E7EAE7] text-gray-600"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className="block text-base font-semibold leading-tight text-gray-900 sm:text-[17px]"
                        style={{ color: selected ? PRIMARY : "#333" }}
                      >
                        {lang.native}
                      </span>
                      <span className="mt-0.5 block text-xs text-gray-500 sm:text-[11px]">
                        {lang.label}
                      </span>
                    </span>
                    {selected ? (
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2E7D32] text-white sm:h-8 sm:w-8">
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div
              className="flex gap-2.5 rounded-2xl border border-[#E5E7EB] bg-[#EEF1F0] px-3 py-2 text-[11px] leading-relaxed sm:gap-3 sm:text-xs"
              style={{ color: PRIMARY }}
            >
              <History className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-500" />
              <p>
                Your last selected language will be remembered if you go back.
              </p>
            </div>
            <button
              type="button"
              onClick={goLanguageContinue}
              disabled={languagesLoading || !selectedLanguage}
              className="mt-3 w-full rounded-2xl py-2.5 text-[15px] font-bold text-white shadow-[0_12px_24px_rgba(13,77,68,0.22)] transition hover:opacity-95 disabled:opacity-50 sm:mt-3 sm:py-3"
              style={{ backgroundColor: PRIMARY }}
            >
              Continue
            </button>
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="mt-2.5 w-full text-center text-[15px] font-medium hover:underline"
              style={{ color: PRIMARY }}
            >
              ← Change country
            </button>
          </div>
        </AuthCard>
      </div>
    );
  }

  if (isSignupAccount) {
    return (
      <div className="flex min-h-full w-full flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
        <AuthCard className="max-w-[440px]">
          <div className="w-full">
            <section
              className={`flex flex-col ${step === 1 ? "min-h-[420px] sm:min-h-[460px]" : "hidden"}`}
            >
              <StepHeader current={3} total={3} />
              <BrandMark className="mb-4" />
              <h2
                className="text-center text-xl font-bold sm:text-2xl"
                style={{ color: PRIMARY }}
              >
                Get Started
              </h2>
              <p className="mt-1 text-center text-sm text-gray-500">
                Login or create an account to continue
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-[#F2F2F2] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0D4D44]/20"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-[#F2F2F2] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0D4D44]/20"
                  />
                </div>
                <form
                  className="flex flex-col gap-3"
                  onSubmit={(e) => e.preventDefault()}
                  noValidate
                >
                  <div className="flex gap-2">
                    <div className="w-36">
                      <AuthAutocompleteDropdown
                        value={formData.dialCode}
                        onChange={(dialValue) =>
                          setFormData({ ...formData, dialCode: dialValue })
                        }
                        options={
                          countryDialOptions.length
                            ? countryDialOptions
                            : [{ value: "91", label: "+91" }]
                        }
                        placeholder="+Code"
                        inputClassName="w-full h-11 rounded-xl border border-gray-200 bg-[#F2F2F2] px-3 text-sm outline-none pr-10"
                      />
                    </div>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={formData.phoneLocal}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneLocal: digitsOnly(e.target.value).slice(0, 12),
                        })
                      }
                      onKeyDown={handlePhoneFieldKeyDown}
                      autoComplete="off"
                      className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-[#F2F2F2] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0D4D44]/20"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Country:{" "}
                    <span className="font-semibold text-gray-700">
                      {readOnboarding().countryLabel ||
                        countryOptions.find((c) => c.value === formData.country)
                          ?.label ||
                        formData.country}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="mt-1 w-full rounded-xl py-3.5 text-base font-bold text-white disabled:opacity-50"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    {sendingOtp ? "Sending code…" : "Continue"}
                  </button>
                </form>
                <div className="my-3 flex items-center gap-2">
                  <hr className="flex-1 border-gray-200" />
                  <span className="text-xs text-gray-400">OTP on WhatsApp</span>
                  <hr className="flex-1 border-gray-200" />
                </div>
              </div>
              <p className="mt-auto pt-6 text-center text-[11px] leading-relaxed text-gray-400">
                By continuing, you agree to our{" "}
                <a
                  href="https://www.cropgenapp.com/terms-conditions"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms & Privacy Policy
                </a>
              </p>
            </section>

            <section
              className={`flex flex-col ${step === 2 ? "min-h-[420px] sm:min-h-[460px]" : "hidden"}`}
            >
              <StepHeader current={4} total={4} />
              <BrandMark className="mb-3" />
              <h2
                className="text-center text-xl font-bold"
                style={{ color: PRIMARY }}
              >
                Verify OTP
              </h2>
              <p className="mt-2 text-center text-sm text-gray-500">
                Enter the 6-digit code sent on WhatsApp to{" "}
                <span className="font-medium text-gray-700">
                  {formData.phone}
                </span>
              </p>
              <div
                className="mt-5 flex justify-center gap-1.5 sm:gap-2"
                onPaste={handleOtpPaste}
              >
                {otpInputs.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className="h-12 w-10 rounded-lg border-2 border-gray-200 bg-[#fafafa] text-center text-lg font-bold outline-none focus:border-[#4caf50] focus:ring-1 focus:ring-[#4caf50]/40 sm:h-14 sm:w-11"
                  />
                ))}
              </div>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-600">
                <Check className="h-4 w-4 text-[#2E7D32]" />
                OTP autofill and paste supported
              </p>
              <button
                type="button"
                disabled
                className="mx-auto mt-3 rounded-full bg-gray-200 px-4 py-2 text-xs font-medium text-gray-500"
              >
                Resend in 30s
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp}
                className="mt-5 w-full rounded-xl py-3.5 text-base font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: PRIMARY }}
              >
                {verifyingOtp ? "Verifying…" : "Verify & Continue"}
              </button>
              <div className="mt-4 flex justify-between gap-2 text-xs sm:text-sm">
                <button
                  type="button"
                  className="font-medium underline"
                  style={{ color: PRIMARY }}
                  onClick={() => {
                    setStep(1);
                    setOtpInputs(Array(6).fill(""));
                    setFormData((prev) => ({ ...prev, otp: "" }));
                    setOtpVerified(false);
                  }}
                >
                  Change phone
                </button>
                <button
                  type="button"
                  className="font-medium underline"
                  style={{ color: PRIMARY }}
                  onClick={() => {
                    dispatch(
                      resendWhatsappOtpThunk({ phone: formData.phone }),
                    ).then((r) => {
                      if (r.meta.requestStatus === "fulfilled") {
                        message.success("OTP resent on WhatsApp");
                      } else {
                        message.error(
                          r.payload?.message || "Failed to resend OTP",
                        );
                      }
                    });
                  }}
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                  onClick={async () => {
                    try {
                      const t = await navigator.clipboard.readText();
                      const p = String(t).replace(/\D/g, "").slice(0, 6);
                      if (p.length === 6) {
                        const digits = p.split("");
                        setOtpInputs(digits);
                        setFormData((prev) => ({ ...prev, otp: p }));
                        inputRefs.current[5]?.focus();
                      }
                    } catch {
                      message.info("Paste not available");
                    }
                  }}
                >
                  <Clipboard className="h-3.5 w-3.5" />
                  Paste code
                </button>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-4">
                <p className="flex items-start justify-center gap-2 text-center text-[11px] text-gray-400">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Verification keeps your farm insights secure and accessible
                  only to you.
                </p>
              </div>
              {otpVerified ? (
                <p className="mt-2 text-center text-sm text-[#2E7D32]">
                  Phone verified
                </p>
              ) : null}
            </section>

            <section
              className={`flex flex-col ${step === 3 ? "min-h-[420px] sm:min-h-[460px]" : "hidden"}`}
            >
              <StepHeader current={4} total={4} />
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-center">
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: PRIMARY }}
                >
                  Organization
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {DEFAULT_ORGANIZATION_CODE}
                </p>
              </div>
              {needsNameOnStep3 && (
                <div className="mt-3 flex flex-col gap-2">
                  <p className="text-center text-xs text-gray-600">
                    Add your name to finish registration.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0D4D44]/25"
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0D4D44]/25"
                    />
                  </div>
                </div>
              )}
              {onboardingRequired && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms-auth"
                      checked={formData.terms}
                      onChange={(e) =>
                        setFormData({ ...formData, terms: e.target.checked })
                      }
                      className="mt-1 h-4 w-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor="terms-auth"
                      className="text-xs text-gray-700"
                    >
                      I agree to the{" "}
                      <a
                        href="https://www.cropgenapp.com/terms-conditions"
                        className="text-sky-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Terms of Use and Privacy Policy
                      </a>
                    </label>
                  </div>
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="wa-auth"
                      checked={formData.whatsappConsent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          whatsappConsent: e.target.checked,
                        })
                      }
                      className="mt-1 h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="wa-auth" className="text-xs text-gray-700">
                      I agree to receive updates on WhatsApp from {APP_NAME}.
                    </label>
                  </div>
                </div>
              )}
              {orgCodeError ? (
                <p className="mt-2 text-xs text-red-600">{orgCodeError}</p>
              ) : null}
              <button
                type="button"
                onClick={handleCompleteProfile}
                disabled={completingProfile}
                className="mt-4 w-full rounded-xl py-3.5 text-base font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: PRIMARY }}
              >
                {completingProfile ? "Finishing…" : "Complete sign up"}
              </button>
            </section>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
      <AuthCard>
        <BrandMark className="mb-5" />
        <h2
          className="text-center text-xl font-bold sm:text-2xl"
          style={{ color: PRIMARY }}
        >
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Sign in with your phone number. We&apos;ll send a WhatsApp OTP.
        </p>
        <div className="relative mt-6 min-h-[320px] overflow-x-visible overflow-y-hidden sm:min-h-[360px]">
          <div
            className="absolute left-0 top-0 h-full w-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateY(${translateY})` }}
          >
            <form
              className="flex h-full min-h-[320px] flex-col sm:min-h-[360px]"
              onSubmit={(e) => e.preventDefault()}
              noValidate
            >
              {/* Prevent aggressive mobile/browser autofill overlays on phone field */}
              <input
                type="text"
                name="fake-username"
                autoComplete="username"
                className="hidden"
                tabIndex={-1}
                aria-hidden="true"
              />
              <input
                type="password"
                name="fake-password"
                autoComplete="new-password"
                className="hidden"
                tabIndex={-1}
                aria-hidden="true"
              />
              <div className="flex gap-2">
                <div className="w-28 sm:w-32">
                  <AuthAutocompleteDropdown
                    value={formData.dialCode}
                    onChange={(dialValue) =>
                      setFormData({ ...formData, dialCode: dialValue })
                    }
                    options={
                      isLogin
                        ? [{ value: "91", label: "🇮🇳 +91" }]
                        : countryDialOptions.length
                          ? countryDialOptions
                          : [{ value: "91", label: "🇮🇳 +91" }]
                    }
                    placeholder="+Code"
                    disabled={isLogin}
                    inputClassName="w-full h-12 rounded-xl border-2 border-gray-200 bg-[#F2F2F2] px-3 pr-10 text-sm text-gray-900 outline-none transition-colors focus:border-[#2E7D32] focus:ring-0"
                  />
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  name="biodrops-phone-manual"
                  data-lpignore="true"
                  data-form-type="other"
                  placeholder="Phone number"
                  value={formData.phoneLocal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phoneLocal: digitsOnly(e.target.value).slice(0, 12),
                    })
                  }
                  onKeyDown={handlePhoneFieldKeyDown}
                  className="h-12 min-w-0 flex-1 rounded-xl border-2 border-gray-200 bg-[#F2F2F2] px-4 text-base text-gray-900 outline-none placeholder:text-gray-400 transition-colors focus:border-[#2E7D32] focus:ring-0"
                />
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="mt-6 w-full rounded-full py-3.5 text-base font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: PRIMARY }}
              >
                {sendingOtp ? "Sending code…" : "Send sign-in code"}
              </button>
              <div className="my-4 flex items-center gap-2">
                <hr className="flex-1 border-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <hr className="flex-1 border-gray-200" />
              </div>
              <SocialButtons />
              <p className="mt-6 text-center text-sm text-gray-500">
                New to {APP_NAME}?{" "}
                <Link
                  to="/signup"
                  className="font-semibold hover:underline"
                  style={{ color: PRIMARY }}
                >
                  Create an account
                </Link>
              </p>
            </form>
            <div className="flex h-full min-h-[320px] flex-col items-center sm:min-h-[360px]">
              <img
                src={tick}
                alt=""
                className="mb-3 h-14 w-14 animate-bounce"
              />
              <h3 className="text-lg font-semibold" style={{ color: PRIMARY }}>
                Check WhatsApp
              </h3>
              <p className="mt-1 text-center text-sm text-gray-500">
                Code sent on WhatsApp to{" "}
                <span className="font-medium text-gray-800">
                  {formData.phone}
                </span>
              </p>
              <div
                className="mt-5 flex justify-center gap-1.5"
                onPaste={handleOtpPaste}
              >
                {otpInputs.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className="h-12 w-10 rounded-lg border-2 border-gray-200 text-center text-lg font-bold outline-none focus:border-[#4caf50] sm:h-14 sm:w-11"
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp}
                className="mt-6 w-full max-w-xs rounded-xl py-3 font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: PRIMARY }}
              >
                {verifyingOtp ? "Verifying…" : "Verify & continue"}
              </button>
              <button
                type="button"
                className="mt-4 text-sm font-medium hover:underline"
                style={{ color: PRIMARY }}
                onClick={() => {
                  setStep(1);
                  setOtpInputs(Array(6).fill(""));
                  setFormData((prev) => ({ ...prev, otp: "" }));
                  setOtpVerified(false);
                }}
              >
                Use a different phone
              </button>
            </div>
          </div>
        </div>
      </AuthCard>
    </div>
  );
};

const AuthAutocompleteDropdown = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  inputClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideTrigger =
        dropdownRef.current && dropdownRef.current.contains(event.target);
      const clickedInsideMenu =
        menuRef.current && menuRef.current.contains(event.target);

      if (!clickedInsideTrigger && !clickedInsideMenu) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !dropdownRef.current) return;

    const updateMenuPosition = () => {
      const rect = dropdownRef.current.getBoundingClientRect();
      setMenuStyle({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    };

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

  const currentLabel = options.find((opt) => opt.value === value)?.label || "";

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (optValue) => {
    onChange(optValue);
    setSearchTerm("");
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleInputFocus = () => {
    if (disabled) return;
    setIsFocused(true);
    setIsOpen(true);
  };

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) inputRef.current?.focus();
  };

  const defaultInputClass =
    "w-full h-12 sm:h-[52px] px-4 bg-white text-[#0b5d3d] rounded-full border-2 border-[#0b5d3d]/40 outline-none placeholder-gray-400 text-sm font-semibold hover:border-[#0b5d3d] transition-all duration-200 focus:ring-2 focus:ring-emerald-200 pr-10 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed";

  return (
    <div className="relative flex flex-col gap-1" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          autoComplete="new-password"
          autoCorrect="off"
          spellCheck={false}
          name="dial-code-manual"
          data-lpignore="true"
          value={isFocused ? searchTerm : currentLabel}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClassName || defaultInputClass}
        />
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors disabled:cursor-not-allowed disabled:text-gray-400 ${
            inputClassName
              ? "text-gray-500 hover:text-gray-700"
              : "text-[#0b5d3d] hover:text-emerald-800"
          }`}
        >
          <ChevronDown
            size={20}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen &&
          !disabled &&
          createPortal(
            <div
              ref={menuRef}
              className="fixed z-[12000] max-h-56 overflow-auto rounded-2xl border border-emerald-200 bg-white shadow-2xl"
              style={{
                top: `${menuStyle.top}px`,
                left: `${menuStyle.left}px`,
                width: `${menuStyle.width}px`,
              }}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, index) => (
                  <div
                    key={opt.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(opt.value)}
                    className={`cursor-pointer px-3 py-2 text-sm text-emerald-900 transition-colors duration-150 hover:bg-emerald-50 ${
                      value === opt.value ? "bg-emerald-100 font-semibold" : ""
                    } ${
                      index !== filteredOptions.length - 1
                        ? "border-b border-emerald-100"
                        : ""
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {opt.flagUrl ? (
                        <img
                          src={opt.flagUrl}
                          alt=""
                          className="h-3.5 w-5 rounded-[2px] border border-emerald-200 object-cover"
                          loading="lazy"
                        />
                      ) : null}
                      <span>{opt.label}</span>
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No matching options
                </div>
              )}
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
};

export default SignupLogin;
