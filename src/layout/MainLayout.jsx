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
  const { loading } = useSelector((state) => state.auth);
  const paymentSuccess = useSelector(
    (state) => state.subscription.paymentSuccess,
  );

  /* ---------- SIDEBAR ---------- */
  const toggleSidebar = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <div
          style={{
            width: isSidebarCollapsed ? "3.7rem" : "14.9rem",
            transition: "margin-left 0.3s ease",
          }}
        >
          <Sidebar onToggleCollapse={toggleSidebar} />
        </div>

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            transition: "margin-left 0.3s ease",
          }}
        >
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
