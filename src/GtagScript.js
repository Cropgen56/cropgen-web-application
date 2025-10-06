import React, { useEffect } from "react";

function GtagScript() {
  useEffect(() => {
    const GA_ID = "G-79869WGEJM";

    // Load gtag.js script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    // Initialize Google Analytics
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", GA_ID);
  }, []);

  return null;
}

export default GtagScript;
