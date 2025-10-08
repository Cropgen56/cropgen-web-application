import React, { useState, useEffect, memo, useRef } from "react";
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
  { path: "/setting", label: "Setting", Icon: Setting },
];

const Sidebar = ({ onToggleCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const logout = useLogout();
  const user = useSelector((state) => state?.auth?.user);

  useEffect(() => {
    dispatch(loadLocalStorage());
    dispatch(decodeToken());
  }, [dispatch]);

  const isInitialized = useRef(false);

  useEffect(() => {
    const BREAKPOINT = 850;

    const updateSidebar = () => {
      const isTabletOrMobile = window.innerWidth < BREAKPOINT;


      if (!isInitialized.current) {
        setIsCollapsed(isTabletOrMobile);
        onToggleCollapse(isTabletOrMobile);
        isInitialized.current = true;
        return;
      }
      setIsCollapsed(isTabletOrMobile);
      onToggleCollapse(isTabletOrMobile);
    };

    updateSidebar();

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateSidebar, 100);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
    };
  }, [onToggleCollapse]);

  const handleCollapseToggle = () => {
    if (window.innerWidth < 850) {
      setShowOverlay(!showOverlay);
    } else {

      const newCollapsedState = !isCollapsed;
      setIsCollapsed(newCollapsedState);
      onToggleCollapse(newCollapsedState);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);

    if (window.innerWidth < 850) {
      setShowOverlay(false);
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

  const collapsedNavItems = [
    <li
      key="collapse-toggle"
      className="collapse-button"
      onClick={handleCollapseToggle}
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

  // Render full sidebar content
  const renderFullSidebar = () => (
    <>
      <div
        className="title-container flex items-center justify-center"
        onClick={() => handleNavigation("/")}
      >
        <img src={img1} alt="CropGen Logo" className="w-[170px]" />
      </div>

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

      <nav className="sidebar-nav">
        <ul>
          {NAV_ITEMS.map(({ path, label, Icon }) => (
            <li
              key={path}
              onClick={() => handleNavigation(path)}
              className={`flex items-center gap-2 cursor-pointer transition-all duration-300 ease-in-out ${location.pathname === path
                ? "px-1.5 pt-[2px] pb-[3px] text-[0.9rem] font-extralight leading-[18.15px] text-left"
                : ""
                }`}
            >
              <Icon />
              {label}
            </li>
          ))}
        </ul>
      </nav>

      <div
        className="offcanvas-footer cursor-pointer mt-5"
        onClick={handleLogout}
      >
        <p className="footer-text flex items-center gap-2">
          <Logout />
          <span>Logout</span>
        </p>
      </div>
    </>
  );

  const renderCollapsedNav = () => (
    <nav className="sidebar-nav">
      <ul className="collapsed-nav-list">
        {collapsedNavItems.map((item, index) => (
          <div key={index} style={{ height: `${spacing}vh` }}>
            {item}
          </div>
        ))}
      </ul>
    </nav>
  );

  if (window.innerWidth < 850) {
    return (
      <div className="sidebar tablet-mobile bg-[#344e41]" >
        <div className="collapsed-sidebar">
          {renderCollapsedNav()}
        </div>

        <Offcanvas
          show={showOverlay}
          onHide={() => setShowOverlay(false)}
          scroll={false}
          backdrop={true}
          className="offcanvas overlay-sidebar"
        >
          <Offcanvas.Body className="p-0 m-0">
            {renderFullSidebar()}
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    );
  }
  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <Offcanvas
        show={true}
        scroll={true}
        backdrop={false}
        className={`offcanvas ${isCollapsed ? "collapsed" : ""}`}
      >
        <Offcanvas.Body className="p-0 m-0">
          {isCollapsed ? renderCollapsedNav() : renderFullSidebar()}
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default memo(Sidebar);