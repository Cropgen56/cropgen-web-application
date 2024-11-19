import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Offcanvas from "react-bootstrap/Offcanvas";
import Card from "react-bootstrap/Card";
import profile from "../../assets/image/pngimages/profile.png";
import {
  AddFieldIcon,
  CropAnalysisIcon,
  CropInformation,
  DieaseDetaction,
  FarmReport,
  Operation,
  SmartAdvisory,
  Weather,
  PersonaliseCropShedule,
  Setting,
  Logout,
  Hammer,
  Logo,
} from "../../assets/Icons";
import "./Sidebar.css";

function Sidebar({ onToggleCollapse }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState("");
  const navigate = useNavigate();

  const handleCollapseToggle = (collapse) => {
    const newCollapsedState = collapse || !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onToggleCollapse(newCollapsedState);
  };

  const handleNavigation = (path) => {
    // set the selected route and change the background color of the active link
    // setSelectedRoute(path);
    navigate(path);
    handleCollapseToggle(true);
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <Offcanvas
        show={true}
        onHide={() => {}}
        scroll={true}
        backdrop={false}
        className={`offcanvas ${isCollapsed ? "collapsed" : ""}`}
      >
        <Offcanvas.Body className="p-0 m-0">
          <div
            className="title-container"
            onClick={() => handleNavigation("/")}
          >
            {!isCollapsed && <Logo />}
            {!isCollapsed && <span className="title-text">CropGen</span>}
          </div>

          {!isCollapsed && (
            <Card
              style={{ width: isCollapsed ? "4rem" : "13rem" }}
              onClick={() => handleNavigation("/profile")}
              className="profile-card"
            >
              <Card.Img variant="top" src={profile} className="profile-image" />
              <Card.Body className="text-center">
                <Card.Title className="profile-user-name">User Name</Card.Title>
                <Card.Text className="profile-user-email">
                  user@gmail.com
                </Card.Text>
              </Card.Body>
            </Card>
          )}

          <nav className="sidebar-nav">
            <ul>
              {isCollapsed && (
                <li
                  className="collapse-button mb-3"
                  onClick={() => handleCollapseToggle(false)}
                >
                  <Hammer />
                </li>
              )}
              <li
                onClick={() => handleNavigation("/cropgen-analytics")}
                style={{
                  backgroundColor:
                    selectedRoute === "/cropgen-analytics"
                      ? "white"
                      : "transparent",
                }}
              >
                <CropAnalysisIcon />
                {!isCollapsed && "CropGen Analytics"}
              </li>
              <li
                onClick={() => handleNavigation("/addfield")}
                style={{
                  backgroundColor:
                    selectedRoute === "/addfield" ? "white" : "transparent",
                }}
              >
                <AddFieldIcon />
                {!isCollapsed && "Add Field"}
              </li>
              <li
                onClick={() => handleNavigation("/weather")}
                style={{
                  backgroundColor:
                    selectedRoute === "/weather" ? "white" : "transparent",
                }}
              >
                <Weather />
                {!isCollapsed && "Weather"}
              </li>
              <li
                onClick={() => handleNavigation("/operation")}
                style={{
                  backgroundColor:
                    selectedRoute === "/operation" ? "white" : "transparent",
                }}
              >
                <Operation />
                {!isCollapsed && "Operation"}
              </li>
              <li
                onClick={() => handleNavigation("/disease-detection")}
                style={{
                  backgroundColor:
                    selectedRoute === "/disease-detection"
                      ? "white"
                      : "transparent",
                }}
              >
                <DieaseDetaction />
                {!isCollapsed && "Disease Detection"}
              </li>
              <li
                onClick={() => handleNavigation("/smart-advisory")}
                style={{
                  backgroundColor:
                    selectedRoute === "/smart-advisory"
                      ? "white"
                      : "transparent",
                }}
              >
                <SmartAdvisory />
                {!isCollapsed && "Smart Advisory"}
              </li>
              <li
                onClick={() => handleNavigation("/crop-information")}
                style={{
                  backgroundColor:
                    selectedRoute === "/crop-information"
                      ? "white"
                      : "transparent",
                }}
              >
                <CropInformation />
                {!isCollapsed && "Crop Information"}
              </li>
              <li
                onClick={() => handleNavigation("/farm-report")}
                style={{
                  backgroundColor:
                    selectedRoute === "/farm-report" ? "white" : "transparent",
                }}
              >
                <FarmReport />
                {!isCollapsed && "Farm Report"}
              </li>
              <li
                onClick={() => handleNavigation("/personalise-crop-shedule")}
                style={{
                  backgroundColor:
                    selectedRoute === "/personalise-crop-shedule"
                      ? "white"
                      : "transparent",
                }}
              >
                <PersonaliseCropShedule />
                {!isCollapsed && "Personalise Crop Schedule"}
              </li>
              <li
                onClick={() => handleNavigation("/setting")}
                style={{
                  backgroundColor:
                    selectedRoute === "/setting" ? "white" : "transparent",
                }}
              >
                <Setting />
                {!isCollapsed && "Setting"}
              </li>
            </ul>
          </nav>
          <div
            className="offcanvas-footer"
            onClick={() => handleNavigation("/logout")}
          >
            <p className="footer-text">
              <Logout />
              {!isCollapsed && <span>Logout</span>}
            </p>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}

export default Sidebar;
