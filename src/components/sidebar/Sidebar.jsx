import React, { useState, useEffect, memo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Offcanvas from "react-bootstrap/Offcanvas";
import Card from "react-bootstrap/Card";
import profile from "../../assets/image/pngimages/profile.png";
import useLogout from "../../utility/logout";
import img1 from "../../assets/image/Frame 63.png";
import { AnimatePresence, motion } from "framer-motion";
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
import {
  decodeToken,
  logoutUser,
  getUserProfileData,
} from "../../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";

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
  { path: "/setting", label: "Setting", Icon: Setting },
];

const Sidebar = ({ onToggleCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const logout = useLogout();

  // Get user data from Redux store
  const user = useSelector((state) => state?.auth?.user);
  const token = useSelector((state) => state.auth.token);
  const status = useSelector((state) => state.auth.status);
  const profileStatus = useSelector((state) => state.auth.profileStatus);
  const { userDetails, userProfile } = useSelector((state) => state.auth);

  // S3 bucket URL for avatar
  const S3_BUCKET_URL =
    process.env.REACT_APP_S3_BUCKET_URL ||
    "https://your-bucket-name.s3.amazonaws.com";

  useEffect(() => {
    dispatch(decodeToken());
  }, [dispatch]);

  useEffect(() => {
  if (token) {
    dispatch(getUserProfileData(token));
  }
  }, [token]);


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
    dispatch(logoutUser());
    const result = await logout();
    if (result.success) {
      message.success("Logout successful");
      setIsLogoutModalOpen(false);
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
        className="cursor-pointer"
      >
        <Icon />
      </li>
    )),
    <li
      key="logout-icon"
      className="cursor-pointer"
      onClick={() => setIsLogoutModalOpen(true)}
    >
      <Logout />
    </li>,
  ];

  const spacing = Math.floor(100 / collapsedNavItems.length);


  const displayFirstName =
    userProfile?.firstName || userDetails?.firstName || user?.firstName || "";
  const displayLastName =
    userProfile?.lastName || userDetails?.lastName || user?.lastName || "";
  const displayEmail =
    userProfile?.email || userDetails?.email || user?.email || "";
  const displayFullName =
    `${displayFirstName} ${displayLastName}`.trim() || "User";

  // Get avatar URL
  const getAvatarUrl = () => {
    const avatar = userProfile?.avatar;
    if (!avatar) return profile;
    if (avatar.startsWith("http")) return avatar;
    return `${S3_BUCKET_URL}/${avatar}`;
  };


  const renderFullSidebar = () => (
    <div className="sidebar-content-wrapper">

      <div
        className="title-container flex items-center justify-center cursor-pointer"
        onClick={() => handleNavigation("/")}
      >
        <img src={img1} alt="CropGen Logo" className="w-[170px]" />
      </div>

  
      <Card
        style={{ width: "13rem", paddingTop: "10px" }}
        onClick={() => handleNavigation("/setting")}
        className="profile-card"
      >
      
        <div className="avatar-container">
          <div className="avatar-wrapper">
            <img
              src={getAvatarUrl()}
              alt="User profile"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = profile;
              }}
            />
          </div>
        </div>
        <Card.Body className="text-center pt-2 pb-3">
          <Card.Title className="profile-user-name mb-1">
            {displayFullName}
          </Card.Title>
          <Card.Text className="profile-user-email mb-0">
            {displayEmail}
          </Card.Text>
        </Card.Body>
      </Card>


      <div className="sidebar-nav-wrapper">
        <nav className="sidebar-nav">
          <ul>
            {NAV_ITEMS.map(({ path, label, Icon }) => (
              <li
                key={path}
                onClick={() => handleNavigation(path)}
              >
                <Icon />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div
        className="offcanvas-footer cursor-pointer"
        onClick={() => setIsLogoutModalOpen(true)}
      >
        <div className="footer-text">
          <Logout />
          <span>Logout</span>
        </div>
      </div>
    </div>
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

  // Logout Modal Component
  const LogoutModal = ({ onClose, onLogout }) => (
    <motion.div
      key="logout-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-white p-6 rounded-xl shadow-lg w-80 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-800">Confirm Logout</h2>
        <p className="text-gray-600 text-sm mt-2">
          Are you sure you want to logout?
        </p>

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all duration-300 ease-in-out font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onLogout}
            className="flex-1 py-2 rounded-lg bg-[#D43C2A] text-white hover:bg-[#C71B06] transition-all duration-300 ease-in-out font-medium"
          >
            Logout
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  if (window.innerWidth < 850) {
    return (
      <div className="sidebar tablet-mobile bg-[#344e41]">
        <div className="collapsed-sidebar">{renderCollapsedNav()}</div>

        <Offcanvas
          show={showOverlay}
          onHide={() => setShowOverlay(false)}
          scroll={false}
          backdrop={true}
          className="offcanvas overlay-sidebar"
        >
          <Offcanvas.Body className="p-0 m-0">
            {renderFullSidebar()}
            <AnimatePresence>
              {isLogoutModalOpen && (
                <LogoutModal
                  onClose={() => setIsLogoutModalOpen(false)}
                  onLogout={handleLogout}
                />
              )}
            </AnimatePresence>
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
      <AnimatePresence>
        {isLogoutModalOpen && (
          <LogoutModal
            onClose={() => setIsLogoutModalOpen(false)}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(Sidebar);