import React, { useState, useEffect, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Offcanvas from "react-bootstrap/Offcanvas";
import Card from "react-bootstrap/Card";
import profile from "../../assets/image/pngimages/profile.png";
import useLogout from "../../utility/logout";
import img1 from "../../assets/image/Frame 63.png";
import {
  AddFieldIcon,
  CropAnalysisIcon,
  DieaseDetaction,
  SoilReportIcon,
  FarmReport,
  Operation,
  SmartAdvisory,
  Weather,
  // PersonaliseCropShedule,
  Setting,
  Logout,
  Hammer,
} from "../../assets/Icons";
import "./Sidebar.css";
import { decodeToken, loadLocalStorage } from "../../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";

const NAV_ITEMS = [
  {
    path: "/cropgen-analytics",
    label: "CropGen Analytics",
    Icon: CropAnalysisIcon,
  },
  { path: "/addfield", label: "Add Field", Icon: AddFieldIcon },
  { path: "/weather", label: "Weather", Icon: Weather },
  { path: "/operation", label: "Operation", Icon: Operation },
  { path: "/disease-detection", label: "Disease Detection", Icon: DieaseDetaction },
  { path: "/smart-advisory", label: "Smart Advisory", Icon: SmartAdvisory },
  { path: "/soil-report", label: "Soil Report", Icon: SoilReportIcon },
  { path: "/farm-report", label: "Farm Report", Icon: FarmReport },
  // {
  //   path: "/personalise-crop-shedule",
  //   label: "Zoning",
  //   Icon: PersonaliseCropShedule,
  // },
  { path: "/setting", label: "Setting", Icon: Setting },
];

const Sidebar = ({ onToggleCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const logout = useLogout();
  const user = useSelector((state) => state?.auth?.user);

  useEffect(() => {
    dispatch(loadLocalStorage());
    dispatch(decodeToken());
  }, [dispatch]);

  useEffect(() => {
    if (location.pathname === "/cropgen-analytics") {
      setIsCollapsed(false);
      onToggleCollapse(false);
    }
  }, [location.pathname, onToggleCollapse]);

  const handleCollapseToggle = (collapse) => {
    const newCollapsedState = collapse ?? !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onToggleCollapse(newCollapsedState);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (path === "/cropgen-analytics") {
      handleCollapseToggle(false);
    } else if (location.pathname === "/cropgen-analytics") {
      handleCollapseToggle(true);
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      alert("Logout successful");
    } else {
      console.error("Logout failed:", result.error);
    }
  };

  // calculate dynamic spacing for collapsed mode
  const collapsedNavItems = [
    <li
      key="collapse-toggle"
      className="collapse-button"
      onClick={() => handleCollapseToggle(false)}
    >
      <Hammer />
    </li>,
    ...NAV_ITEMS.map(({ path, Icon }) => (
      <li
        key={path}
        onClick={() => handleNavigation(path)}
        className={`cursor-pointer`}
      >
        <Icon />
      </li>
    )),
    <li key="logout-icon" className="cursor-pointer" onClick={handleLogout}>
      <Logout />
    </li>,
  ];

  const spacing = Math.floor(100 / collapsedNavItems.length); // % per icon

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <Offcanvas
        show={true}
        scroll={true}
        backdrop={false}
        className={`offcanvas ${isCollapsed ? "collapsed" : ""}`}
      >
        <Offcanvas.Body className="p-0 m-0">
          {/* Logo */}
          {!isCollapsed && (
            <div
              className="title-container flex items-center justify-center"
              onClick={() => handleNavigation("/")}
            >
              <img src={img1} alt="CropGen Logo" className="w-[170px]" />
            </div>
          )}

          {/* User Card */}
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

          {/* Navigation */}
          <nav className="sidebar-nav">
            <ul className={!isCollapsed ? "" : "collapsed-nav-list"}>
              {!isCollapsed
                ? NAV_ITEMS.map(({ path, label, Icon }) => (
                    <li
                      key={path}
                      onClick={() => handleNavigation(path)}
                      className={`flex items-center gap-2 cursor-pointer transition-all duration-300 ease-in-out ${
                        location.pathname === path
                          ? "px-1.5 pt-[2px] pb-[3px] text-[0.9rem] font-extralight leading-[18.15px] text-left"
                          : ""
                      }`}
                    >
                      <Icon />
                      {label}
                    </li>
                  ))
                : collapsedNavItems.map((item, index) => (
                    <div key={index} style={{ height: `${spacing}vh` }}>
                      {item}
                    </div>
                  ))}
            </ul>
          </nav>

          {/* Logout Button (only when expanded) */}
          {!isCollapsed && (
            <div
              className="offcanvas-footer cursor-pointer mt-5"
              onClick={handleLogout}
            >
              <p className="footer-text flex items-center gap-2">
                <Logout />
                <span>Logout</span>
              </p>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default memo(Sidebar);
