import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import { Building2 } from "lucide-react";
import {
  getUserProfileData,
  updateUserData,
} from "../../redux/slices/authSlice";
import { getCountries } from "../../api/locationApi";
import { validateOrganizationCode } from "../../api/authApi";
import { getStaticCountries } from "../../config/countriesFallback";
import { DEFAULT_ORGANIZATION_CODE, AUTH_ROUTES } from "../../config/brand";
import {
  getPhoneValidationError,
  maxLocalPhoneLength,
  normalizePhoneLocal,
  buildE164,
} from "../../utils/phone";

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

export function isProfileDetailsIncomplete(user) {
  if (!user) return true;
  const firstName = String(user.firstName || "").trim();
  const lastName = String(user.lastName || "").trim();
  const phone = String(user.phone || "").trim();
  const country = String(user.country || "").trim();
  return !firstName || !lastName || !phone || !country;
}

function toLocalPhone(rawPhone, dialCode = "91") {
  return normalizePhoneLocal(dialCode, rawPhone);
}

function orgCodeFromUser(user) {
  const code = String(
    user?.organization?.organizationCode || user?.organizationCode || "",
  )
    .trim()
    .toUpperCase();
  // Keep the input empty when the user is on the default org so "leave blank" works.
  if (!code || code === DEFAULT_ORGANIZATION_CODE) return "";
  return code;
}

const PRIMARY = "#0D4D44";
const fieldClass =
  "h-11 w-full rounded-xl border border-[#D5DDD8] bg-[#F8FAF9] px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0D4D44] focus:bg-white focus:ring-2 focus:ring-[#0D4D44]/15 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60";
const labelClass =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500";

const Field = ({ label, required, children }) => (
  <div>
    {label ? (
      <label className={labelClass}>
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
    ) : null}
    {children}
  </div>
);

/**
 * Blocking overlay after Google (or any) login when profile details are incomplete.
 */
const CompleteProfileGate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user, userProfile, profileStatus, googleSignupPending } =
    useSelector((state) => state.auth);
  const userId = user?.id || userProfile?.id || userProfile?._id;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dialCode: "91",
    phoneLocal: "",
    country: "IN",
    organizationCode: "",
  });
  const [countries, setCountries] = useState(() => getStaticCountries());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [orgError, setOrgError] = useState("");
  const [orgHint, setOrgHint] = useState("");
  const [checkingOrg, setCheckingOrg] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const orgCheckRef = useRef(0);

  useEffect(() => {
    if (token && profileStatus === "idle" && !userProfile) {
      dispatch(getUserProfileData());
    }
  }, [token, profileStatus, userProfile, dispatch]);

  useEffect(() => {
    let active = true;
    getCountries().then((data) => {
      if (active && Array.isArray(data) && data.length > 0) {
        setCountries(data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const source = userProfile || user;
    if (!source) return;
    setForm((prev) => ({
      firstName: source.firstName || prev.firstName || "",
      lastName: source.lastName || prev.lastName || "",
      email: source.email || prev.email || "",
      dialCode: prev.dialCode || "91",
      phoneLocal: source.phone
        ? toLocalPhone(source.phone)
        : prev.phoneLocal,
      country: source.country || prev.country || "IN",
      organizationCode:
        orgCodeFromUser(source) || prev.organizationCode || "",
    }));
  }, [userProfile, user]);

  useEffect(() => {
    const code = String(form.organizationCode || "").trim().toUpperCase();
    if (!code) {
      setOrgError("");
      setOrgHint("");
      setCheckingOrg(false);
      return undefined;
    }

    const checkId = ++orgCheckRef.current;
    setCheckingOrg(true);
    setOrgError("");
    setOrgHint("");
    const timer = setTimeout(async () => {
      try {
        const result = await validateOrganizationCode(code);
        if (orgCheckRef.current !== checkId) return;
        setOrgError("");
        setOrgHint(
          result?.organizationName
            ? `Joining ${result.organizationName}`
            : `Organization ${code} found`,
        );
      } catch (err) {
        if (orgCheckRef.current !== checkId) return;
        const msg =
          err?.response?.data?.message ||
          (typeof err === "string" ? err : "") ||
          `Organization '${code}' not found. Leave blank to join ${DEFAULT_ORGANIZATION_CODE}.`;
        setOrgHint("");
        setOrgError(msg);
      } finally {
        if (orgCheckRef.current === checkId) setCheckingOrg(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [form.organizationCode]);

  const profileUser = userProfile || user;
  const waitingForProfile =
    Boolean(token) &&
    !userProfile &&
    profileStatus !== "failed";
  const missingName =
    !String(profileUser?.firstName || "").trim() ||
    !String(profileUser?.lastName || "").trim();
  const showGate =
    Boolean(token) &&
    !waitingForProfile &&
    (googleSignupPending || missingName);

  const countryOptions = useMemo(
    () =>
      (countries || []).map((c) => ({
        value: c.iso2,
        label: c.name,
      })),
    [countries],
  );

  const phoneError = phoneTouched
    ? getPhoneValidationError(form.dialCode, form.phoneLocal)
    : "";

  const isValid =
    String(form.firstName || "").trim() &&
    String(form.lastName || "").trim() &&
    emailOk(form.email) &&
    !getPhoneValidationError(form.dialCode, form.phoneLocal) &&
    form.country &&
    !orgError &&
    !checkingOrg;

  const handleSave = async () => {
    if (!userId) {
      setError("User session not ready. Please refresh.");
      return;
    }
    setPhoneTouched(true);
    const phoneErr = getPhoneValidationError(form.dialCode, form.phoneLocal);
    if (!isValid || phoneErr) {
      setError(phoneErr || "Please fill all required details.");
      return;
    }

    if (orgError) {
      setError(orgError);
      return;
    }

    const phone = buildE164(form.dialCode, form.phoneLocal);
    const organizationCode =
      String(form.organizationCode || "").trim().toUpperCase() ||
      DEFAULT_ORGANIZATION_CODE;
    setSaving(true);
    setError("");
    try {
      await dispatch(
        updateUserData({
          id: userId,
          updateData: {
            firstName: String(form.firstName).trim(),
            lastName: String(form.lastName).trim(),
            email: String(form.email).trim().toLowerCase(),
            phone,
            country: form.country,
            organizationCode,
          },
        }),
      ).unwrap();

      await dispatch(getUserProfileData());
      message.success("Profile updated successfully");
      const onAuthScreen = Object.values(AUTH_ROUTES).includes(
        location.pathname,
      );
      if (onAuthScreen) {
        navigate("/cropgen-analytics", { replace: true });
      }
    } catch (err) {
      const msg =
        (typeof err === "string" && err) ||
        err?.message ||
        err?.payload?.message ||
        "Failed to update profile";
      setError(typeof msg === "string" ? msg : "Failed to update profile");
      message.error(typeof msg === "string" ? msg : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!showGate) return null;

  return (
    <div className="fixed inset-0 z-[9000] flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div className="flex max-h-[94dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-white/30 bg-white shadow-[0_24px_64px_rgba(13,77,68,0.28)] sm:rounded-3xl">
        <div className="shrink-0 border-b border-[#E8EEEA] bg-gradient-to-b from-[#F3F8F5] to-white px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start gap-3.5">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
              style={{ backgroundColor: PRIMARY }}
            >
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2
                className="text-lg font-bold tracking-tight sm:text-xl"
                style={{ color: PRIMARY }}
              >
                Choose your organization
              </h2>
              <p className="mt-0.5 text-sm leading-snug text-gray-500">
                Enter an organization code, or leave blank to join{" "}
                {DEFAULT_ORGANIZATION_CODE}.
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
          <Field label="Organization code">
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                className="h-11 w-full rounded-xl border border-[#D5DDD8] bg-[#F8FAF9] pl-10 pr-3 text-sm uppercase text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0D4D44] focus:bg-white focus:ring-2 focus:ring-[#0D4D44]/15"
                placeholder={DEFAULT_ORGANIZATION_CODE}
                value={form.organizationCode}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                autoFocus
                name="cropgen-organization-code"
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    organizationCode: e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, ""),
                  }))
                }
              />
            </div>
            {orgError ? (
              <p className="mt-1 text-xs text-red-600">{orgError}</p>
            ) : orgHint ? (
              <p className="mt-1 text-xs text-emerald-700">{orgHint}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Leave blank to join {DEFAULT_ORGANIZATION_CODE}
              </p>
            )}
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="First name" required>
              <input
                className={fieldClass}
                placeholder="First name"
                autoComplete="given-name"
                value={form.firstName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, firstName: e.target.value }))
                }
              />
            </Field>
            <Field label="Last name" required>
              <input
                className={fieldClass}
                placeholder="Last name"
                autoComplete="family-name"
                value={form.lastName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, lastName: e.target.value }))
                }
              />
            </Field>
          </div>

          <Field label="Email" required>
            <input
              className={fieldClass}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </Field>

          <Field label="Phone" required>
            <div className="grid grid-cols-[4.75rem_minmax(0,1fr)] gap-2.5">
              <input
                className={`${fieldClass} text-center font-medium`}
                value={`+${form.dialCode}`}
                readOnly
                aria-label="Country code"
              />
              <input
                className={`${fieldClass} ${
                  phoneError ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""
                }`}
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="Mobile number"
                value={form.phoneLocal}
                maxLength={maxLocalPhoneLength(form.dialCode)}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    phoneLocal: normalizePhoneLocal(
                      prev.dialCode,
                      e.target.value,
                    ),
                  }))
                }
                onBlur={() => setPhoneTouched(true)}
                aria-invalid={Boolean(phoneError)}
                aria-describedby={
                  phoneError ? "profile-phone-error" : undefined
                }
              />
            </div>
            {phoneError ? (
              <p id="profile-phone-error" className="mt-1 text-xs text-red-600">
                {phoneError}
              </p>
            ) : null}
          </Field>

          <Field label="Country" required>
            <select
              className={fieldClass}
              value={form.country}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, country: e.target.value }))
              }
            >
              <option value="">Select country</option>
              {countryOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-[#E8EEEA] bg-white px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isValid}
            className="w-full rounded-xl py-3.5 text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(13,77,68,0.28)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
            style={{ backgroundColor: PRIMARY }}
          >
            {saving ? "Saving…" : "Save & continue"}
          </button>
          <p className="mt-2 text-center text-[11px] text-gray-500">
            Required to use CropGen features on your farm.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfileGate;
