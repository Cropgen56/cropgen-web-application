import React from "react";
import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
// import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <AppRoutes />
      {/* <Toaster position="top-right" autoClose={1500} theme="light" /> */}
    </>
  );
};
export default App;
