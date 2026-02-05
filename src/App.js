import React, { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useSelector } from "react-redux";
import { initActivityTracker } from "./utility/activityTracker";
import WhatsAppButton from "../src/components/comman/WhatsAppButton.jsx";

const App = () => {
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) {
      initActivityTracker(token);
    }
  }, [token]);

  return (
    <>
      <AppRoutes />
      <WhatsAppButton />
    </>
  );
};

export default App;
