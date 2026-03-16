import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/sidebar/Sidebar";
import PaymentSuccessModal from "../components/subscription/PaymentSuccessModal";

import { decodeToken } from "../redux/slices/authSlice";
import { clearPaymentSuccess } from "../redux/slices/subscriptionSlice";

const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const dispatch = useDispatch();

  /* ---------- AUTH INIT ---------- */
  useEffect(() => {
    dispatch(decodeToken());
  }, [dispatch]);

  /* ---------- REDUX STATE ---------- */
  const { status } = useSelector((state) => state.auth);
  const paymentSuccess = useSelector(
    (state) => state.subscription.paymentSuccess,
  );

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
          style={{ width: isSidebarCollapsed ? "3.7rem" : "14.9rem" }}
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
