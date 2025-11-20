import React from "react";
import img1 from "../../../assets/image/Group 31.png";


function ComingSoonSection() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center px-6 py-10">
      <img
        src={img1}
        alt="Coming Soon Illustration"
        className="w-[320px] h-[320px] mb-6 opacity-90"
      />

      <h2 className="text-3xl font-semibold text-white mb-2">
        This Feature is Coming Soon
      </h2>

      <p className="text-white/90 text-lg max-w-lg leading-relaxed">
        Our team is working to bring this feature to you very soon. Stay tuned
        for updates and new enhancements.
      </p>
    </div>
  );
}

export default ComingSoonSection;
