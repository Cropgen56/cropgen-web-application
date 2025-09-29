import React, { useState } from "react";
import FarmReportSidebar from "../components/farmreport/farmreportsidebar/FarmReportSidebar";
import img1 from "../assets/image/Group 31.png"
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const FarmReport = () => {
  const [selectedField, setSelectedField] = useState({});
  const [setIsSidebarVisible] = useState(true);
  const fields = useSelector((state) => state?.farmfield?.fields);
  const navigate = useNavigate();
  

  const isFieldSelected = () => {
    return selectedField && selectedField.title;

  };
  
    if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-[#5a7c6b] text-center px-4">
        {/* Centered Background Image */}
        <img
          src={img1}
          alt="No Fields"
          className="w-[400px] h-[400px] mb-6 opacity-70"
        />

        {/* Text */}
        <h2 className="text-2xl font-semibold text-white">
          Add Farm to See the Farm Report
        </h2>

        {/* Optional Button */}
        <button
          onClick={() => navigate("/addfield")}
          className="mt-6 px-5 py-2 rounded-lg bg-white text-[#5a7c6b] font-medium hover:bg-gray-200 transition"
        >
          Add Field
        </button>
      </div>
    );
  }


  return (
    <div className="m-0 p-0 w-full flex flex-row">
      {/* farm report sidebar */}
      <FarmReportSidebar
        selectedField={selectedField}
        setSelectedField={setSelectedField}
        setIsSidebarVisible={setIsSidebarVisible}
      />
      {/* Main weather body */}
      <div className="h-screen w-screen bg-[#5a7c6b] flex justify-center items-center relative body">
        <div className="absolute">
          <svg
            width="270"
            height="270"
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_867_324)">
              <path
                d="M25 200C25 219.401 27.9948 237.956 33.9844 255.664C39.974 273.372 48.5026 289.648 59.5703 304.492C70.638 319.336 83.8542 332.161 99.2188 342.969C114.583 353.776 131.51 361.979 150 367.578V393.359C127.995 387.63 107.812 378.646 89.4531 366.406C71.0938 354.167 55.2734 339.453 41.9922 322.266C28.7109 305.078 18.4245 286.133 11.1328 265.43C3.84115 244.727 0.130208 222.917 0 200C0 181.641 2.34375 163.932 7.03125 146.875C11.7188 129.818 18.4896 113.932 27.3438 99.2188C36.1979 84.5052 46.6146 71.0286 58.5938 58.7891C70.5729 46.5495 84.0495 36.0677 99.0234 27.3438C113.997 18.6198 129.948 11.9141 146.875 7.22656C163.802 2.53906 181.51 0.130208 200 0C217.578 0 234.505 2.14844 250.781 6.44531C267.057 10.7422 282.422 16.9271 296.875 25C311.328 33.0729 324.544 42.7734 336.523 54.1016C348.503 65.4297 358.984 77.9948 367.969 91.7969C376.953 105.599 384.115 120.573 389.453 136.719C394.792 152.865 398.112 169.596 399.414 186.914L369.336 156.836C364.388 137.565 356.576 119.857 345.898 103.711C335.221 87.5651 322.331 73.6328 307.227 61.9141C292.122 50.1953 275.521 41.1458 257.422 34.7656C239.323 28.3854 220.182 25.1302 200 25C183.854 25 168.359 27.0833 153.516 31.25C138.672 35.4167 124.805 41.276 111.914 48.8281C99.0234 56.3802 87.1745 65.5599 76.3672 76.3672C65.5599 87.1745 56.4453 98.9583 49.0234 111.719C41.6016 124.479 35.6771 138.411 31.25 153.516C26.8229 168.62 24.7396 184.115 25 200ZM200 100C186.198 100 173.242 102.604 161.133 107.812C149.023 113.021 138.477 120.182 129.492 129.297C120.508 138.411 113.346 149.023 108.008 161.133C102.669 173.242 100 186.198 100 200C100 213.411 102.474 226.172 107.422 238.281C112.37 250.391 119.661 261.198 129.297 270.703L111.523 288.477C99.6745 276.628 90.625 263.086 84.375 247.852C78.125 232.617 75 216.667 75 200C75 188.542 76.4974 177.474 79.4922 166.797C82.487 156.12 86.6536 146.159 91.9922 136.914C97.3307 127.669 103.841 119.271 111.523 111.719C119.206 104.167 127.669 97.6562 136.914 92.1875C146.159 86.7188 156.12 82.487 166.797 79.4922C177.474 76.4974 188.542 75 200 75C209.766 75 219.336 76.1068 228.711 78.3203C238.086 80.5339 247.005 83.8542 255.469 88.2812C263.932 92.7083 271.94 97.9167 279.492 103.906C287.044 109.896 293.685 116.927 299.414 125H265.43C256.315 116.927 246.224 110.742 235.156 106.445C224.089 102.148 212.37 100 200 100ZM317.773 150L400 232.227V400H175V150H317.773ZM325 192.773V225H357.227L325 192.773ZM375 375V250H300V175H200V375H375ZM350 275V350H325V275H350ZM225 350V250H250V350H225ZM275 350V300H300V350H275Z"
                fill="#A7A5A5"
                fillOpacity="0.5"
              />
            </g>
            <defs>
              <clipPath id="clip0_867_324">
                <rect width="400" height="400" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <p className="text-[1.3rem] text-[#d9d9d9] font-bold z-20">
          {isFieldSelected()
            ? `Selected Field: ${selectedField.title}`
            : "Select a Field to Generate Report"}
        </p>
        <button
          className="px-3"
          style={{
            position: "absolute",
            zIndex: 2,
            marginTop: "25rem",
            padding: "5 10px",
            border: "none",
            borderRadius: "5px",
            color: "#344e41",
            fontSize: "1.2rem",
            fontWeight: "600",
            display: isFieldSelected() ? true : "none",
          }}
        >
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default FarmReport;
