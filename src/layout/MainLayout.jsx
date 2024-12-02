import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";

const MainLayout = () => {
  // State to track if the sidebar is collapsed
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Function to toggle sidebar collapse
  const toggleSidebar = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

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
