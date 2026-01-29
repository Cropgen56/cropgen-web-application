import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { sendFarmAdvisoryWhatsApp } from "../../../redux/slices/smartAdvisorySlice";
import { updateUserData } from "../../../redux/slices/authSlice";

/* ================= ICON MAP ================= */

const ACTIVITY_ICON = {
  SPRAY: "🧴",
  FERTIGATION: "🌿",
  IRRIGATION: "🚿",
  WEATHER: "🌦️",
  CROP_RISK: "⚠️",
};

/* ================= PHONE FORMATTER ================= */
/**
 * Converts any Indian phone input to +91XXXXXXXXXX
 */
const formatIndianPhoneNumber = (phone) => {
  if (!phone) return "";

  let cleaned = phone.replace(/[^\d]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }

  if (cleaned.startsWith("91") && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  if (phone.startsWith("+91") && cleaned.length === 12) {
    return phone;
  }

  return `+91${cleaned.slice(-10)}`;
};

/* ================= ACTIVITY CARD ================= */

const ActivityCard = ({ activity }) => (
  <div className="flex gap-4 border-b py-3 last:border-b-0">
    <div className="text-xl">
      {ACTIVITY_ICON[activity.type] || "📌"}
    </div>

    <div className="flex-1">
      <p className="font-semibold text-gray-800">
        {activity.title}
      </p>

      <p className="text-sm text-gray-600 mt-1">
        {activity.message}
      </p>

      {activity.details && (
        <div className="mt-2 text-xs text-gray-500 space-y-1">
          {activity.details.chemical && <div>🧴 {activity.details.chemical}</div>}
          {activity.details.fertilizer && <div>🌿 {activity.details.fertilizer}</div>}
          {activity.details.quantity && <div>📏 {activity.details.quantity}</div>}
          {activity.details.method && <div>🚜 {activity.details.method}</div>}
          {activity.details.time && <div>⏰ {activity.details.time}</div>}
        </div>
      )}
    </div>
  </div>
);

/* ================= MAIN COMPONENT ================= */

export default function FarmAdvisoryCard() {
  const dispatch = useDispatch();

  const { advisory, loading } = useSelector(
    (state) => state.smartAdvisory || {}
  );

  const { userProfile, token } = useSelector(
    (state) => state.auth || {}
  );

  const activities = advisory?.activitiesToDo || [];

  /* ================= LOCAL STATE ================= */

  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [successDialog, setSuccessDialog] = useState(false);

  /* ================= SEND WHATSAPP ================= */

  const sendWhatsApp = async ({phoneWithCountryCode,language}) => {
    if (!advisory?._id) {
      alert("Farm advisory not available");
      return;
    }

    console.log()

    const whatsappPhone = phoneWithCountryCode.replace(/[^\d]/g, "");

    await dispatch(
      sendFarmAdvisoryWhatsApp({
        phone: whatsappPhone,
        farmAdvisoryId: advisory._id, // ✅ TRACKING ID
        language: language
      })
    ).unwrap();

    setSuccessDialog(true);
  };

  /* ================= HANDLERS ================= */

  const handleAcceptAll = async () => {
    if (!activities.length) return;

    if (userProfile?.phone) {
      try {
        await sendWhatsApp({phoneWithCountryCode:userProfile.phone,language:"en"});
      } catch (error) {
        alert("Failed to send advisory on WhatsApp");
      }
    } else {
      setShowPhoneDialog(true);
    }
  };


  const handleAcceptAllHindi = async () => {
    if (!activities.length) return;

    if (userProfile?.phone) {
      try {
        await sendWhatsApp({phoneWithCountryCode:userProfile.phone,language:"hi"});
      } catch (error) {
        alert("Failed to send advisory on WhatsApp");
      }
    } else {
      setShowPhoneDialog(true);
    }
  };

  

  const handleSavePhoneAndSend = async () => {
    if (!phoneInput) {
      alert("Please enter phone number");
      return;
    }

    const formattedPhone = formatIndianPhoneNumber(phoneInput);

    if (!formattedPhone.match(/^\+91\d{10}$/)) {
      alert("Please enter a valid Indian phone number");
      return;
    }

    try {
      await dispatch(
        updateUserData({
          token,
          id: userProfile._id,
          updateData: { phone: formattedPhone },
        })
      ).unwrap();

      setShowPhoneDialog(false);
      await sendWhatsApp(formattedPhone);
    } catch (error) {
      alert("Failed to update phone number");
    }
  };

  /* ================= UI ================= */

  return (
    <>
      <div className="w-full bg-[#335343] rounded-t-xl overflow-hidden">
        <div className="px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">
            Activities To Do
          </h2>
        </div>

        <div className="bg-white px-6 py-4">
          {loading ? (
            <p className="text-gray-500 text-sm">
              Loading advisory…
            </p>
          ) : activities.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No activities available for today.
            </p>
          ) : (
            activities.map((activity, idx) => (
              <ActivityCard
                key={`${activity.type}-${idx}`}
                activity={activity}
              />
            ))
          )}
        </div>

        {!loading && activities.length > 0 && (
          <div className="bg-white border-t px-6 py-4 flex justify-center gap-4">
            <button
              onClick={handleAcceptAll}
              className="bg-green-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-green-700 transition"
            >
              ✅ Accept En
            </button>
            <button
              onClick={handleAcceptAllHindi}
              className="bg-green-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-green-700 transition"
            >
              ✅ Accept Hi
            </button>

            <button
              onClick={() => alert("All activities rejected")}
              className="bg-red-500 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-red-600 transition"
            >
              ❌ Reject All
            </button>
          </div>
        )}
      </div>

      {/* ================= PHONE DIALOG ================= */}

      {showPhoneDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md">
            <h3 className="text-lg font-semibold text-gray-800">
              Enter Phone Number
            </h3>

            <p className="text-sm text-gray-600 mt-1">
              Phone number is required to send advisory on WhatsApp.
            </p>

            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="Enter phone number"
              className="w-full mt-4 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowPhoneDialog(false)}
                className="px-4 py-2 text-sm border rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={handleSavePhoneAndSend}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save & Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUCCESS DIALOG ================= */}

      {successDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md text-center">
            <div className="text-green-600 text-3xl mb-2">✅</div>

            <h3 className="text-lg font-semibold text-gray-800">
              Operation Advisory Saved
            </h3>

            <p className="text-sm text-gray-600 mt-2">
              Advisory has been successfully delivered to WhatsApp.
            </p>

            <button
              onClick={() => setSuccessDialog(false)}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
