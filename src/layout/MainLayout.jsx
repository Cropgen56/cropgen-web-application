import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import { message } from "antd";

import Sidebar from "../components/sidebar/Sidebar";
import PaymentSuccessModal from "../components/subscription/PaymentSuccessModal";

import { decodeToken } from "../redux/slices/authSlice";
import { clearPaymentSuccess } from "../redux/slices/subscriptionSlice";
import { getFarmFields } from "../redux/slices/farmSlice";
import { demoActivateAllSubscriptions } from "../api/subscriptionApi";
import {
  getDemoKeyFromUrl,
  stripDemoKeyFromUrl,
  beginDemoActivate,
  endDemoActivate,
} from "../utility/demoAccess";

const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const dispatch = useDispatch();

  /* ---------- AUTH INIT ---------- */
  useEffect(() => {
    dispatch(decodeToken());
  }, [dispatch]);

  /* ---------- REDUX STATE ---------- */
  const { status, user } = useSelector((state) => state.auth);
  const paymentSuccess = useSelector(
    (state) => state.subscription.paymentSuccess,
  );

  /* ---------- DEMO URL KEY → ACTIVATE ALL FARMS ---------- */
  useEffect(() => {
    if (status === "loading") return;

    const userId = user?.id;
    if (!userId) return;

    const demoKey = getDemoKeyFromUrl();
    if (!demoKey) return;

    // Strip immediately so remount does not see the key again
    stripDemoKeyFromUrl();

    if (!beginDemoActivate()) return;

    (async () => {
      try {
        const result = await demoActivateAllSubscriptions(demoKey);
        await dispatch(getFarmFields(userId)).unwrap();

        const activated = result?.activatedCount ?? 0;
        const skipped = result?.skippedCount ?? 0;
        if (activated > 0) {
          message.success(
            `Demo unlock: ${activated} farm(s) subscribed` +
              (skipped ? ` (${skipped} already active)` : ""),
          );
        } else if (skipped > 0) {
          message.info("All farms already have an active subscription");
        } else {
          message.info(result?.message || "No farms to activate");
        }
      } catch (err) {
        endDemoActivate();
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Demo activation failed";
        message.error(msg);
      }
    })();
  }, [status, user?.id, dispatch]);

  /* ---------- SIDEBAR ---------- */
  const toggleSidebar = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex min-h-screen min-h-[100dvh] w-full">
        {/* Sidebar */}
        <div
          className="flex-shrink-0 transition-[width] duration-300 ease-out"
          style={{ width: isSidebarCollapsed ? "3.75rem" : "16.25rem" }}
        >
          <Sidebar onToggleCollapse={toggleSidebar} />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden transition-[margin] duration-300 ease-out safe-area-inset">
          <Outlet />
        </main>
      </div>

      {/* ---------- PAYMENT SUCCESS MODAL (GLOBAL) ---------- */}
      <PaymentSuccessModal
        isOpen={Boolean(paymentSuccess)}
        onClose={() => dispatch(clearPaymentSuccess())}
        fieldName={paymentSuccess?.fieldName}
        planName={paymentSuccess?.planName}
        features={paymentSuccess?.features}
        daysLeft={paymentSuccess?.daysLeft}
        transactionId={paymentSuccess?.transactionId}
      />
    </>
  );
};

export default MainLayout;
