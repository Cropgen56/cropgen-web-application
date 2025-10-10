import { useEffect, useState } from "react";

const useIsTablet = () => {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkIsTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width <= 1366);
    };

    checkIsTablet();
    window.addEventListener("resize", checkIsTablet);
    return () => window.removeEventListener("resize", checkIsTablet);
  }, []);

  return isTablet;
};

export default useIsTablet;
