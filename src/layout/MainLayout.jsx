import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import { useDispatch } from "react-redux";
import { loadLocalStorage, decodeToken } from "../redux/slices/authSlice";

const MainLayout = () => {
  // State to track if the sidebar is collapsed
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Function to toggle sidebar collapse
  const toggleSidebar = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadLocalStorage());
    dispatch(decodeToken());
  }, [dispatch]);

  // Get authentication status from Redux store
  const { loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
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

      {/* Main Content Area */}
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
  );
};

export default MainLayout;
