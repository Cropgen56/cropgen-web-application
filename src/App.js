import React, { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useSelector } from "react-redux";
import { initActivityTracker } from "./utility/activityTracker";
import WhatsAppButton from "./components/comman/WhatsAppButton.jsx";

const App = () => {
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (!token) return;
    const cleanup = initActivityTracker();
    return cleanup;
  }, [token]);

  return (
    <>
      <AppRoutes />
      <WhatsAppButton />
    </>
  );
};

export default App;
