import React, { useState, useEffect, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Offcanvas from "react-bootstrap/Offcanvas";
import Card from "react-bootstrap/Card";
import profile from "../../assets/image/pngimages/profile.png";
import useLogout from "../../utility/logout";
import {
  AddFieldIcon,
  CropAnalysisIcon,
  DieaseDetaction,
  SoilReportIcon,
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
import { decodeToken, loadLocalStorage } from "../../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";

// Navigation items configuration
const NAV_ITEMS = [
  {
    path: "/cropgen-analytics",
    label: "CropGen Analytics",
    Icon: CropAnalysisIcon,
  },
  { path: "/addfield", label: "Add Field", Icon: AddFieldIcon },
  { path: "/weather", label: "Weather", Icon: Weather },
  { path: "/operation", label: "Operation", Icon: Operation },
  {
    path: "/disease-detection",
    label: "Disease Detection",
    Icon: DieaseDetaction,
  },
  { path: "/smart-advisory", label: "Smart Advisory", Icon: SmartAdvisory },
  { path: "/soil-report", label: "Soil Report", Icon: SoilReportIcon },
  { path: "/farm-report", label: "Farm Report", Icon: FarmReport },
  {
    path: "/personalise-crop-shedule",
    label: "Personalise Crop Schedule",
    Icon: PersonaliseCropShedule,
  },
  { path: "/setting", label: "Setting", Icon: Setting },
];

const Sidebar = ({ onToggleCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const logout = useLogout();
  const user = useSelector((state) => state?.auth?.user);

  // Load local storage and decode token on mount
  useEffect(() => {
    dispatch(loadLocalStorage());
    dispatch(decodeToken());
  }, [dispatch]);

  // Set initial sidebar state based on current path
  useEffect(() => {
    if (location.pathname === "/cropgen-analytics") {
      setIsCollapsed(false);
      onToggleCollapse(false);
    }
  }, [location.pathname, onToggleCollapse]);

  // Handle sidebar collapse toggle
  const handleCollapseToggle = (collapse) => {
    const newCollapsedState = collapse ?? !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onToggleCollapse(newCollapsedState);
  };

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    // If navigating to /cropgen-analytics, ensure sidebar is open
    if (path === "/cropgen-analytics") {
      handleCollapseToggle(false);
    } else if (location.pathname === "/cropgen-analytics") {
      handleCollapseToggle(true);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      alert("Logout successful");
      // Optionally show a success message (e.g., using react-toastify)
    } else {
      console.error("Logout failed:", result.error);
      // Optionally show an error message
    }
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <Offcanvas
        show={true}
        scroll={true}
        backdrop={false}
        className={`offcanvas ${isCollapsed ? "collapsed" : ""}`}
        résultats
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
              style={{ width: "13rem" }}
              onClick={() => handleNavigation("/setting")}
              className="profile-card"
            >
              <img src={profile} className="profile-image" alt="User profile" />
              <Card.Body className="text-center">
                <Card.Title className="profile-user-name">
                  {user?.firstName} {user?.lastName}
                </Card.Title>
                <Card.Text className="profile-user-email">
                  {user?.email}
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
              {NAV_ITEMS.map(({ path, label, Icon }) => (
                <li
                  key={path}
                  onClick={() => handleNavigation(path)}
                  // className={location.pathname === path ? "active" : ""}
                  className={`flex items-center gap-2 cursor-pointer transition-all duration-300 ease-in-out
                    ${location.pathname === path ? "px-1.5 pt-[2px] pb-[3px] text-[0.9rem] font-extralight leading-[18.15px] text-left " : ""}`}>
                  <Icon />
                  {!isCollapsed && label}
                </li>
              ))}
            </ul>
          </nav>
          <div className="offcanvas-footer" onClick={handleLogout}>
            <p className="footer-text">
              <Logout />
              {!isCollapsed && <span>Logout</span>}
            </p>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default memo(Sidebar);
