import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import profile from "../../assets/image/pngimages/profile.png";
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
  // Hammer,
  Logo,
} from "../../assets/Icons";
import "./Sidebar.css"
import { decodeToken, loadLocalStorage } from "../../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";

const Sidebar = ({ onToggleCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadLocalStorage());
    dispatch(decodeToken());
  }, [dispatch]);

  const handleCollapseToggle = (collapse) => {
    const newCollapsedState = collapse || !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onToggleCollapse) onToggleCollapse(newCollapsedState);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (path !== "/cropgen-analytics") {
      handleCollapseToggle(true);
    }
  };

  const user = useSelector((state) => state?.auth?.user);

  return (
    <div className={`inline-flex min-h-screen transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-60 md:w-70'} bg-green-900 text-white fixed md:relative z-50`}>
      <div className="flex flex-col w-full h-full">
        <div className="flex items-center mb-2 px-4 py-3 cursor-pointer" onClick={() => handleNavigation("/")}> 
          {!isCollapsed && <Logo className="mr-2 h-10" />}
          {!isCollapsed && <span className="text-white text-lg font-semibold">CropGen</span>}
          <button 
            className="ml-auto text-white bg-green-900 focus:outline-none text-2xl"
            onClick={(e) => {
              e.stopPropagation();
              handleCollapseToggle();
            }}
          >
            {isCollapsed ? '☰' : '✕'}
          </button>
        </div>

        {!isCollapsed && (
          <Card className="mx-auto mb-4 bg-teal-700 !bg-green-700 text-white text-center cursor-pointer w-11/12" onClick={() => handleNavigation("/profile")}>              
            <img src={profile} alt="Profile" className="w-20 h-20 rounded-full mx-auto mt-4" />
            <Card.Body>
              <Card.Title className="text-xl font-bold">{user?.firstName} {user?.lastName}</Card.Title>
              <Card.Text className="text-sm">{user?.email}</Card.Text>
            </Card.Body>
          </Card>
        )}

        <nav className="px-4">
          <ul className="space-y-4">
            <li className="my-2 text-[0.85rem] font-normal leading-[2rem] text-gray-200 cursor-pointer" onClick={() => handleNavigation("/cropgen-analytics")}> <CropAnalysisIcon /> {!isCollapsed && "CropGen Analytics"} </li>
            <li className="my-2 text-[0.85rem] font-normal leading-[2rem] text-gray-200 cursor-pointer" onClick={() => handleNavigation("/addfield")}> <AddFieldIcon /> {!isCollapsed && "Add Field"} </li>
            <li className="my-2 text-[0.85rem] font-normal leading-[2rem] text-gray-200 cursor-pointer" onClick={() => handleNavigation("/weather")}> <Weather /> {!isCollapsed && "Weather"} </li>
            <li className="my-2 text-[0.85rem] font-normal leading-[2rem] text-gray-200 cursor-pointer" onClick={() => handleNavigation("/operation")}> <Operation /> {!isCollapsed && "Operation"} </li>
            <li className="my-2 text-[0.85rem] font-normal leading-[2rem] text-gray-200 cursor-pointer" onClick={() => handleNavigation("/disease-detection")}> <DieaseDetaction /> {!isCollapsed && "Disease Detection"} </li>
            <li className="my-2 text-[0.85rem] font-normal leading-[2rem] text-gray-200 cursor-pointer" onClick={() => handleNavigation("/smart-advisory")}> <SmartAdvisory /> {!isCollapsed && "Smart Advisory"} </li>
            <li className="my-2 text-[0.85rem] font-normal leading-[2rem] text-gray-200 cursor-pointer" onClick={() => handleNavigation("/soil-report")}> <SoilReportIcon /> {!isCollapsed && "Soil Report"} </li>
            <li className="my-2 text-[0.85rem] font-normal leading-[2rem] text-gray-200 cursor-pointer" onClick={() => handleNavigation("/farm-report")}> <FarmReport /> {!isCollapsed && "Farm Report"} </li>
            <li className="my-2 text-[0.85rem] font-normal leading-[2rem] text-gray-200 cursor-pointer" onClick={() => handleNavigation("/personalise-crop-shedule")}> <PersonaliseCropShedule /> {!isCollapsed && "Personalise Crop Schedule"} </li>
            <li className="my-2 text-[0.85rem] font-normal leading-[2rem] text-gray-200 cursor-pointer" onClick={() => handleNavigation("/setting")}> <Setting /> {!isCollapsed && "Setting"} </li>
          </ul>
        </nav>
        <div className="flex gap-2 text-white text-base cursor-pointer pl-4 py-4" onClick={() => handleNavigation("/logout")}> <Logout className="w-5 h-5" /> {!isCollapsed && <span>Logout</span>} </div>
      </div>
    </div>
  );
};

export default Sidebar;
