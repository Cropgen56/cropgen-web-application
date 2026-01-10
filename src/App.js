import React,{useEffect} from "react";
import AppRoutes from "./routes/AppRoutes";
import { useSelector } from "react-redux";
import { initActivityTracker } from "./utility/activityTracker";


const App = () => {
  const token = useSelector((state) => state.auth.token);

  console.log(token)
   useEffect(() => {
    if (token) {
      initActivityTracker(token);
    }
  }, [token]);


  return (
    <>
      <AppRoutes />
    </>
  );
};

export default App;