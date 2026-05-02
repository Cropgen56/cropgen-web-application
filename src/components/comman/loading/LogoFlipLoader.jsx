import React from "react";
import SimpleLoader from "./SimpleLoader";

const LogoFlipLoader = () => {
  return (
    <div className="flex h-[200px] items-center justify-center">
      <SimpleLoader size="lg" variant="onDark" />
    </div>
  );
};

export default LogoFlipLoader;
