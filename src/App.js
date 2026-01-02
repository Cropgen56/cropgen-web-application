import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { useSelector } from "react-redux";
// import { Toaster } from "react-hot-toast";

const App = () => {
  const token = useSelector((state) => state.auth.token);

  // console.log(token);

  return (
    <>
      <AppRoutes />
      {/* <Toaster position="top-right" autoClose={1500} theme="light" /> */}
    </>
  );
};

export default App;