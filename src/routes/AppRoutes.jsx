import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import ProtectedRoute from "../authroute/ProtectedRoute";
import LoadingSpinner from "../components/comman/loading/LoadingSpinner";
import { AUTH_ROUTES } from "../config/brand";

// Code-split every page: each route's code (maps, charts, PDF tooling…)
// is only downloaded when a user actually visits it. MainLayout wraps the
// page outlet in <Suspense>, so the sidebar stays visible while it loads.
const Dashboard = lazy(() => import("../pages/Dashboard"));
const AddField = lazy(() => import("../pages/AddField"));
const Weather = lazy(() => import("../pages/Weather"));
const DiseaseDetection = lazy(() => import("../pages/DiseaseDetection"));
const SmartAdvisory = lazy(() => import("../pages/SmartAdviosory"));
const SoilReport = lazy(() => import("../pages/SoilReport"));
const Zoning = lazy(() => import("../pages/Zoning"));
const PersonaliseCropSchedule = lazy(
  () => import("../pages/PersonaliseCropSchedule"),
);
const Setting = lazy(() => import("../pages/Setting"));
const Operation = lazy(() => import("../pages/Operation"));
const Profile = lazy(() => import("../pages/Profile"));
const PageNotFound = lazy(() => import("../pages/PageNotFound"));
const AuthLayout = lazy(() => import("../pages/AuthLayout"));
const FarmReport = lazy(() => import("../pages/FarmReport"));

const RouteFallback = () => (
  <div className="h-screen flex items-center justify-center bg-[#344e41]">
    <LoadingSpinner color="#ffffff" />
  </div>
);

const AppRoutes = () => {
  return (
    <Router
      basename="/"
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Suspense fallback={<RouteFallback />}>
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
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="cropgen-analytics" element={<Dashboard />} />
            <Route path="addfield" element={<AddField />} />
            <Route path="weather" element={<Weather />} />
            <Route path="operation" element={<Operation />} />
            <Route path="disease-detection" element={<DiseaseDetection />} />
            <Route path="smart-advisory" element={<SmartAdvisory />} />
            <Route path="soil-report" element={<SoilReport />} />
            <Route path="zoning" element={<Zoning />} />
            <Route path="farm-report" element={<FarmReport />} />
            <Route
              path="Personalise-crop-schedule"
              element={<PersonaliseCropSchedule />}
            />
            <Route path="setting" element={<Setting />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>
          <Route path={AUTH_ROUTES.login} element={<AuthLayout />} />
          <Route path={AUTH_ROUTES.signup} element={<AuthLayout />} />
          <Route path={AUTH_ROUTES.signupLanguage} element={<AuthLayout />} />
          <Route path={AUTH_ROUTES.signupAccount} element={<AuthLayout />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRoutes;
