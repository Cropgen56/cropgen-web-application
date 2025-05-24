import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Offcanvas from "react-bootstrap/Offcanvas";
import Card from "react-bootstrap/Card";
import profile from "../../assets/image/pngimages/profile.png";
import { logoutUser } from "../../utility/logout";

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

const Sidebar = ({ onToggleCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // handle to collaps the sidebar
  const handleCollapseToggle = (collapse) => {
    const newCollapsedState = collapse || !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onToggleCollapse(newCollapsedState);
  };

  // load the loadLocalStorage data
  useEffect(() => {
    dispatch(loadLocalStorage());
    dispatch(decodeToken());
  }, [dispatch]);

  // handel to navigate
  const handleNavigation = (path) => {
    navigate(path);
    if (path !== "/cropgen-analytics") {
      handleCollapseToggle(true);
    }
  };

  // handle logout function
  const handelLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      await logoutUser();
      navigate("/login");
    }
  };

  // get the user data formt he redux store
  const user = useSelector((state) => state?.auth?.user);

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
              <img variant="top" src={profile} className="profile-image" />
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
              <li
                onClick={() => {
                  handleNavigation("/cropgen-analytics");
                }}
              >
                <CropAnalysisIcon />
                {!isCollapsed && "CropGen Analytics"}
              </li>
              <li onClick={() => handleNavigation("/addfield")}>
                <AddFieldIcon />
                {!isCollapsed && "Add Field"}
              </li>
              <li onClick={() => handleNavigation("/weather")}>
                <Weather />
                {!isCollapsed && "Weather"}
              </li>
              <li onClick={() => handleNavigation("/operation")}>
                <Operation />
                {!isCollapsed && "Operation"}
              </li>
              <li onClick={() => handleNavigation("/disease-detection")}>
                <DieaseDetaction />
                {!isCollapsed && "Disease Detection"}
              </li>
              <li onClick={() => handleNavigation("/smart-advisory")}>
                <SmartAdvisory />
                {!isCollapsed && "Smart Advisory"}
              </li>
              <li onClick={() => handleNavigation("/soil-report")}>
                <SoilReportIcon />
                {!isCollapsed && "Soil Report"}
              </li>
              <li onClick={() => handleNavigation("/farm-report")}>
                <FarmReport />
                {!isCollapsed && "Farm Report"}
              </li>
              <li onClick={() => handleNavigation("/personalise-crop-shedule")}>
                <PersonaliseCropShedule />
                {!isCollapsed && "Personalise Crop Schedule"}
              </li>
              <li onClick={() => handleNavigation("/setting")}>
                <Setting />
                {!isCollapsed && "Setting"}
              </li>
            </ul>
          </nav>
          <div className="offcanvas-footer" onClick={handelLogout}>
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

export default Sidebar;
