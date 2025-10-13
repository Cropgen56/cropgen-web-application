import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { refreshAccessToken } from "../redux/slices/authSlice";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token, status } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && token && status === "idle") {
      dispatch(refreshAccessToken()).catch(() =>
        navigate("/login", { replace: true })
      );
    }
  }, [isAuthenticated, token, status, dispatch, navigate]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
