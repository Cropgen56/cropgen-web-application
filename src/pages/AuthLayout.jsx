import React, { useState, useEffect } from "react";
import SignupLogin from "../components/AuthLayout/signup/SignupLogin";
import { decodeToken } from "../redux/slices/authSlice";
import { useDispatch } from "react-redux";
import laptop from "../assets/image/login/laptop-overlay.png";
import logo from "../assets/image/login/logo.png";
import sphere from "../assets/image/login/Desktop-background.svg";
import img1 from "../assets/logo/Group 503.svg";
import img2 from "../assets/logo/Group 504.svg";
import img3 from "../assets/logo/Group 505.svg";
import img4 from "../assets/logo/Group 506.svg";
import img5 from "../assets/logo/Group 507.svg";
import img6 from "../assets/logo/Group 508.svg";
import img7 from "../assets/logo/Group 509.svg";

const AuthLayout = () => {
  const dispatch = useDispatch();
  const [animate, setAnimate] = useState(false);
  const [height, setHeight] = useState(window.innerHeight);
  const [width, setWidth] = useState(window.innerWidth);
  const isSmallTablet = width <= 834;
  const animationDuration = 15;

  const planets = [
    { img: img1, label: "Crop Advisory" },
    { img: img2, label: "Weather Insights" },
    { img: img3, label: "Soil Health" },
    { img: img4, label: "Pest & Disease" },
    { img: img5, label: "Irrigation Status" },
    { img: img6, label: "NDVI Map" },
    { img: img7, label: "Field Analytics" },
  ];

  const getResponsiveSizes = () => {
    if (width > 800) {
      return {
        sphereSize: 250,
        orbitRadius: 100,
        planetSize: 12,
        laptopWidth: 190,
      };
    } else if (width > 700) {
      return {
        sphereSize: 220,
        orbitRadius: 85,
        planetSize: 11,
        laptopWidth: 170,
      };
    } else if (width > 600) {
      return {
        sphereSize: 200,
        orbitRadius: 75,
        planetSize: 10,
        laptopWidth: 150,
      };
    } else if (width > 500) {
      return {
        sphereSize: 180,
        orbitRadius: 65,
        planetSize: 9,
        laptopWidth: 130,
      };
    } else {
      return {
        sphereSize: 150,
        orbitRadius: 55,
        planetSize: 8,
        laptopWidth: 110,
      };
    }
  };

  const responsiveSizes = getResponsiveSizes();

  useEffect(() => {
    dispatch(decodeToken());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight);
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, {});

  return (
    <div className="relative w-full h-screen overflow-hidden font-poppins">
      {!isSmallTablet ? (
        <div className="flex flex-row w-full h-full">
          <div className="w-1/2 relative h-full bg-[#344E41]">
            <div className="absolute top-4 left-4 lg:top-6 lg:left-6 flex items-center gap-2">
              <img src={logo} alt="Logo" className="h-12 lg:h-20 w-auto" />
            </div>
            <div className="flex flex-col gap-4 justify-center items-center h-full w-full">
              <div className="lg:mt-20 mt-32 mx-6 lg:mx-0 text-center">
                <h2 className="text-xl lg:text-3xl font-bold text-white [text-shadow:0px_4px_4px_#00000040]">
                  Your Smart Farming Assistant
                </h2>
                <p className="text-sm lg:text-base font-medium max-w-lg mb-2 text-white [text-shadow:0px_4px_4px_#00000040]">
                  Powered by satellite insights, CropGen helps you detect,
                  decide, and grow better—field by field.
                </p>
                <div className="relative mt-2 w-80 lg:w-[28rem] mx-auto">
                  <img
                    src={sphere}
                    alt="Sun"
                    className="relative z-10 w-full h-auto"
                  />

                  <div className="absolute inset-0 flex items-center justify-center z-30">
                    <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px]">
                      {planets.map((planet, i) => {
                        const total = planets.length;
                        const angle = (360 / total) * i;

                        return (
                          <div
                            key={i}
                            className="absolute left-1/2 top-1/2 w-0 h-0"
                            style={{
                              animation: `orbit ${animationDuration}s linear infinite`,
                              animationDelay: `-${(i * animationDuration) / total
                                }s`,
                              transformOrigin: "center center",
                            }}
                          >
                            <div
                              className="absolute flex items-center justify-center"
                              style={{
                                top: "-190px",
                                left: "0",
                                transform: `translateX(-95%) rotate(-${angle}deg)`,
                              }}
                            >
                              <div
                                className="w-20 h-20 flex items-center justify-center"
                                style={{
                                  animation: `counterOrbit ${animationDuration}s linear infinite reverse`,
                                }}
                              >
                                <img
                                  src={planet.img}
                                  alt=""
                                  className="w-20 h-20 object-contain"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <img
                    src={laptop}
                    alt="Laptop"
                    className="absolute left-[-6rem] top-1/2 -translate-y-1/2 z-40 w-80 lg:w-[500px] xl:w-[600px] max-w-full"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="w-1/2 flex justify-center items-center h-full ">
            <SignupLogin />
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full h-full z-40">
          <div
            className="relative w-full bg-[#344E41] flex transition-all duration-300"
            style={{
              height:
                width > 830
                  ? "25vh"
                  : width > 730
                    ? "15vh"
                    : width > 600
                      ? "22vh"
                      : "22vh",
            }}
          >
            <div className="flex-1 flex justify-start items-center px-2 relative">
              <div
                className="absolute top-[20%] pointer-events-none"
                style={{
                  width: `${responsiveSizes.sphereSize}px`,
                  height: `${responsiveSizes.sphereSize}px`
                }}
              >
                <img
                  src={sphere}
                  alt="Background"
                  className="relative z-10 w-full h-auto"
                />

                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <div
                    className="relative"
                    style={{
                      width: `${responsiveSizes.sphereSize}px`,
                      height: `${responsiveSizes.sphereSize}px`,
                      transform: "translate(4px, -4px)"
                    }}
                  >
                    {planets.map((planet, i) => {
                      const total = planets.length;
                      const angle = (360 / total) * i;
                      const animationDuration = 15;

                      return (
                        <div
                          key={i}
                          className="absolute left-1/2 top-1/2 w-0 h-0"
                          style={{
                            animation: `orbit ${animationDuration}s linear infinite`,
                            animationDelay: `-${(i * animationDuration) / total
                              }s`,
                            transformOrigin: "center center",
                          }}
                        >
                          <div
                            className="absolute flex items-center justify-center"
                            style={{
                              top: `-${responsiveSizes.orbitRadius}px`,
                              left: "0",
                              transform: `translateX(-95%) rotate(-${angle}deg)`,
                            }}
                          >
                            <div
                              className="flex items-center justify-center"
                              style={{
                                width: `${responsiveSizes.planetSize * 4}px`,
                                height: `${responsiveSizes.planetSize * 4}px`,
                                animation: `counterOrbit ${animationDuration}s linear infinite reverse`,
                              }}
                            >
                              <img
                                src={planet.img}
                                alt=""
                                className="object-contain"
                                style={{
                                  width: `${responsiveSizes.planetSize * 4}px`,
                                  height: `${responsiveSizes.planetSize * 4}px`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <img
                  src={laptop}
                  alt="Laptop"
                  className="absolute top-1/2 -translate-y-1/2 z-30 max-w-full"
                  style={{
                    width: `${responsiveSizes.laptopWidth}px`,
                    left: `-${responsiveSizes.laptopWidth * 0.08}px`
                  }}
                />

                <div className="absolute inset-0 rounded-full bg-white/20 blur-3xl animate-[spin_12s_linear_infinite]" />
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-start px-2">
              <div className="absolute top-2 right-2 flex items-center gap-2">
                <img src={logo} alt="Logo" className="h-16 w-auto" />
              </div>
              <div className="mt-16 -translate-x-28 text-left">
                <h2 className="text-[16px] font-bold text-white text-center [text-shadow:0px_4px_4px_#00000040]">
                  Your Smart Farming Assistant
                </h2>
                <p className="text-[10px] font-medium text-white text-center [text-shadow:0px_4px_4px_#00000040] max-w-[90%]">
                  Powered by satellite insights, CropGen helps you detect,
                  decide, and grow better—field by field.
                </p>
              </div>
            </div>
          </div>
          <div className="h-[65vh] bg-white flex-grow flex overflow-hidden">
            <SignupLogin />
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthLayout;