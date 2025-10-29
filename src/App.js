import React from "react";
import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
// import { Toaster } from "react-hot-toast";

const App = () => {
  useEffect(() => {
    const handleWheel = (e) => {
      // Block page zoom (Ctrl + scroll or pinch)
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e) => {
      // Block Ctrl + (+/-) and Ctrl + 0
      if (
        e.ctrlKey &&
        (e.key === "+" ||
          e.key === "-" ||
          e.key === "=" ||
          e.key === "_" ||
          e.key === "0")
      ) {
        e.preventDefault();
      }
    };

    // Add listeners
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <AppRoutes />
      {/* <Toaster position="top-right" autoClose={1500} theme="light" /> */}
    </>
  );
};
export default App;
