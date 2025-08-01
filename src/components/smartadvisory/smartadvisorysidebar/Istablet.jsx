import { useEffect, useState } from "react";

const useIsTablet = () => {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkIsTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width <= 1024); // ✅ Tablet and smaller
    };

    checkIsTablet(); // Run on first load
    window.addEventListener("resize", checkIsTablet);
    return () => window.removeEventListener("resize", checkIsTablet);
  }, []);

  return isTablet;
};

export default useIsTablet;
