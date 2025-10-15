import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { refreshAccessToken } from "../redux/slices/authSlice";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token, status, refreshPending } = useSelector(
    (state) => state.auth
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!token && status !== "loading" && !refreshPending) {
        try {
          await dispatch(refreshAccessToken()).unwrap();
        } catch (error) {
          navigate("/login", { replace: true });
        }
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [dispatch, token, status, refreshPending, navigate]);

  if (isChecking || status === "loading" || refreshPending) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
