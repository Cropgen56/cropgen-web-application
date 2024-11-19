import React from "react";

const LanguageSwitcher = () => {
  return (
    <div className="language-switcher">
      <select>
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
