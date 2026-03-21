import React from "react";
import CropGenAiChat from "../components/cropgenai/CropGenAiChat";

/** Canvas: sidebar-adjacent greens + soft vignette (Sidebar #344e41) */
const CropGenAI = () => {
  return (
    <div
      className="relative min-h-0 h-[100dvh] w-full overflow-hidden font-poppins"
      style={{
        background: `
          radial-gradient(100% 70% at 50% -20%, rgba(134, 215, 47, 0.08) 0%, transparent 50%),
          radial-gradient(80% 60% at 100% 100%, rgba(45, 64, 56, 0.9) 0%, transparent 45%),
          linear-gradient(160deg, #3a5248 0%, #344e41 38%, #28372f 100%)
        `,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.15)_100%)]"
        aria-hidden
      />
      <CropGenAiChat />
    </div>
  );
};

export default CropGenAI;
