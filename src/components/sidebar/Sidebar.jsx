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
  { path: "/cropgen-analytics", label: "CropGen Analytics", Icon: CropAnalysisIcon },
  { path: "/addfield", label: "Add Field", Icon: AddFieldIcon },
  { path: "/weather", label: "Weather", Icon: Weather },
  { path: "/operation", label: "Operation", Icon: Operation },
  { path: "/disease-detection", label: "Disease Detection", Icon: DieaseDetaction },
  { path: "/smart-advisory", label: "Smart Advisory", Icon: SmartAdvisory },
  { path: "/soil-report", label: "Soil Report", Icon: SoilReportIcon },
  { path: "/farm-report", label: "Farm Report", Icon: FarmReport },
  { path: "/personalise-crop-shedule", label: "Personalise Crop Schedule", Icon: PersonaliseCropShedule },
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

  // useEffect(() => {
  //   if (location.pathname === "/cropgen-analytics") {
  //     setIsCollapsed(false);
  //     onToggleCollapse(false);
  //   }
  // }, [location.pathname, onToggleCollapse]);

  const handleCollapseToggle = (collapse) => {
    const newCollapsedState = collapse ?? !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onToggleCollapse(newCollapsedState);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (path === "/cropgen-analytics") {
      handleCollapseToggle(true);
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

  return (
    <div
      className={`sidebar ${isCollapsed ? "collapsed" : ""} flex min-h-screen transition-[width] duration-300 ease-in-out`}
    >
      <Offcanvas
        show={true}
        scroll={true}
        backdrop={false}
        className={`offcanvas ${isCollapsed ? "collapsed" : ""} fixed top-0 left-0 h-full z-[1030] border-r border-gray-300 bg-[#344e41] overflow-y-auto transition-[width] duration-300 ease-in-out`}
      >
        <Offcanvas.Body className="p-0 m-0 scrollbar-none">
          <div
            className="title-container flex items-center mb-3 pl-12 cursor-pointer"
            onClick={() => handleNavigation("/")}
          >
            {!isCollapsed && <Logo />}
            {!isCollapsed && (
              <span className="title-text text-[1.2rem] text-[#f8f8f8] ml-1">CropGen</span>
            )}
          </div>

          {!isCollapsed && (
            <Card
              style={{ width: "13rem" }}
              onClick={() => handleNavigation("/setting")}
              className="profile-card mx-20px auto my-5 bg-[#5a7c6b] cursor-pointer"
            >
              <img
                src={profile}
                className="profile-image w-[80px] h-[80px] m-auto z-50"
                alt="User profile"
              />
              <Card.Body className="text-center">
                <Card.Title className="profile-user-name text-[25px] font-semibold text-[#f8f8f8]">
                  {user?.firstName} {user?.lastName}
                </Card.Title>
                <Card.Text className="profile-user-email text-[0.9rem] font-light leading-[18.15px] text-[#d9d9d9]">
                  {user?.email}
                </Card.Text>
              </Card.Body>
            </Card>
          )}

          <nav className="sidebar-nav px-2">
            <ul className="list-none p-0">
              {isCollapsed && (
                <li
                  className="collapse-button mb-3 bg-transparent border-none cursor-pointer block opacity-100 visible"
                  onClick={() => handleCollapseToggle(false)}
                >
                  <Hammer />
                </li>
              )}
              {NAV_ITEMS.map(({ path, label, Icon }) => (
                <li
                  key={path}
                  onClick={() => handleNavigation(path)}
                  className={`${
                    location.pathname === path ? "active" : ""
                  } flex items-center gap-2 my-2 text-[0.85rem] font-normal leading-8 text-[#f5f5f5] cursor-pointer`}
                >
                  <Icon />
                  {!isCollapsed && label}
                </li>
              ))}
            </ul>
          </nav>

          <div className="offcanvas-footer text-center mt-auto" onClick={handleLogout}>
            <p className="footer-text flex items-center gap-2 text-white text-base pl-4 cursor-pointer">
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
