import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Dashboard from "../pages/Dashboard";
import CropGenAnalytics from "../pages/CropGenAnalytics";
import AddField from "../pages/AddField";
import Weather from "../pages/Weather";
import DiseaseDetection from "../pages/DiseaseDetection";
import SmartAdvisory from "../pages/SmartAdviosory";
import SoilReport from "../pages/SoilReport";
import FarmReport from "../pages/FarmReport";
import PersonaliseCropSchedule from "../pages/PersonaliseCropSchedule";
import Setting from "../pages/Setting";
import Operation from "../pages/Operation";
import Profile from "../pages/Profile";
import PageNotFound from "../pages/PageNotFound";
import AuthLayout from "../pages/AuthLayout";
import ProtectedRoute from "../authroute/ProtectedRoute";
import ResetPassword from "../components/AuthLayout/signup/Resetpassowrd";

const AppRoutes = () => {
  return (
    <Router basename="/">
      <Routes>
        {/* Main Site Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cropgen-analytics" element={<Dashboard />} />
          <Route path="/addfield" element={<AddField />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/operation" element={<Operation />} />
          <Route path="/disease-detection" element={<DiseaseDetection />} />
          <Route path="/smart-advisory" element={<SmartAdvisory />} />
          <Route path="/soil-report" element={<SoilReport />} />
          <Route path="/farm-report" element={<FarmReport />} />
          <Route
            path="/Personalise-crop-shedule"
            element={<PersonaliseCropSchedule />}
          />
          <Route path="/setting" element={<Setting />} />
        </Route>
        <Route path="/login" element={<AuthLayout />} />
        <Route path="/*" element={<PageNotFound />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
