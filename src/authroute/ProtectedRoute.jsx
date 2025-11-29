import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { refreshAccessToken } from "../redux/slices/authSlice";
import LogoFlipLoader from "../components/comman/loading/LogoFlipLoader";
import { motion, AnimatePresence } from "framer-motion";

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
    return <div className="flex justify-center items-center h-screen w-full bg-[#344e41] realtive ">

      <AnimatePresence>
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0  flex flex-col items-center justify-center z-[1000] rounded-2xl"
        >
          <LogoFlipLoader />
          <p className="text-white text-xl mt-2 font-bold animate-pulse">
            Loading...
          </p>
        </motion.div>
      </AnimatePresence>
    </div>;
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
