import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { Card, Layout, Menu, Progress } from "antd";
import "../App.css";
import {
  L,
  CA,
  AF,
  CI,
  DD,
  FA,
  OP,
  S,
  SA,
  Weather,
  SOA,
  Soil,
  Rice,
} from "../../assets/icons";
import MapData from "./MapsView";
import { PieChart } from "react-minimal-pie-chart";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import WeatherData from "./Weather";
import DiseaseDetection from "./disease_Detection";
import { Area } from "recharts";
import { AreaChart } from "recharts";
import CalendarView from "./Operations";
import PlantGrowthStagesCard from "./PlantGrowthStages";
import { useNavigate } from "react-router-dom";

const events = [
  {
    start: new Date("2024-09-04T12:00:00"),
    end: new Date("2024-09-04T13:00:00"),
    title: "Demo",
  },
];

const { Sider } = Layout;

const Navbar = ({ selectedMenu, setSelectedMenu }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [forecast, setForecast] = useState([]);
  const apiKey = "55914755213187993587f0bcd665271b";
  const lat = 19.076;
  const lon = 72.8777;
  // State to manage the selected time frame and dropdown visibility
  // const [selectedTimeFrame, setSelectedTimeFrame] = useState('Weekly');
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate(); // Initialize useNavigate

  // Function to handle logout
  const handleLogout = () => {
    // Clear user info from local storage
    localStorage.removeItem("user");

    // Redirect to login page
    navigate("/"); // Redirect to Login page
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );

        const dailyData = response.data.list.reduce((acc, reading) => {
          const dateObj = new Date(reading.dt * 1000);
          const date = ` ${dateObj
            .toLocaleDateString("en-US", { weekday: "short" })
            .toLocaleUpperCase()} ${dateObj.getDate()} ${dateObj.toLocaleDateString(
            "en-US",
            { month: "short" }
          )}`;

          if (!acc[date]) {
            acc[date] = {
              temp: reading.main.temp,
              icon: reading.weather[0].icon,
              description: reading.weather[0].description,
            };
          }
          return acc;
        }, {});

        setForecast(Object.entries(dailyData).slice(0, 5));
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchWeather();
  }, [lat, lon, apiKey]);

  // const handleDropdownToggle = () => {
  //   setIsDropdownOpen(prev => !prev);
  // };

  // Function to handle time frame selection
  // const handleTimeFrameSelect = (timeFrame) => {
  //   setSelectedTimeFrame(timeFrame);
  //   setIsDropdownOpen(false);
  // };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const lineData = [
    { name: "D0", Line1: 40, Line2: 24 },
    { name: "D1", Line1: 30, Line2: 13 },
    { name: "D2", Line1: 20, Line2: 98 },
    { name: "D3", Line1: 27, Line2: 39 },
    { name: "D4", Line1: 18, Line2: 48 },
    { name: "D5", Line1: 23, Line2: 38 },
    { name: "D6", Line1: 34, Line2: 43 },
    { name: "D7", Line1: 44, Line2: 53 },
  ];

  const values = [30, 60, 100];
  const segmentColors = ["#78A3AD", "#344E41", "#5A7C6B"];

  const totalValue = values[0];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuClick = (key) => {
    console.log(`Menu clicked: ${key}`);
    setSelectedMenu((prevKey) => (prevKey === key ? null : key));
    setCollapsed(true);
  };

  const menuItems = [
    { key: "CropGenAnalytics", icon: <CA />, label: "CropGen Analytics" },
    { key: "AddField", icon: <AF />, label: "Add Field" },
    { key: "Weather", icon: <Weather />, label: "Weather" },
    { key: "Operations", icon: <OP />, label: "Operations" },
    { key: "DiseaseDetection", icon: <DD />, label: "Disease Detection" },
    { key: "SmartAdvisory", icon: <SA />, label: "Smart Advisory" },
    { key: "CropInformation", icon: <CI />, label: "Crop Information" },
    {
      key: "SoilAnalysis",
      icon: (
        <span className="menu-soil2">
          <Soil />
        </span>
      ),
      label: <span className="menu-soil">Soil Analysis</span>,
    },
    { key: "FarmReport", icon: <FA />, label: "Farm Report" },
    {
      key: "PersonaliseCropSchedule",
      icon: <SOA />,
      label: (
        <span className="menu-label">
          Personalised Crop
          <br />
          Information
        </span>
      ),
    },
    { key: "Settings", icon: <S />, label: "Settings" },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case "CropGenAnalytics":
        return <div>CropGen Analytics</div>;
      case "AddField":
        return <div>Add Field Content</div>;
      case "Weather":
        return (
          <div>
            <WeatherData />
          </div>
        );
      case "Operations":
        return <CalendarView events={events} />;
      case "DiseaseDetection":
        return (
          <div>
            <DiseaseDetection />
          </div>
        );
      case "SmartAdvisory":
        return <div>Smart Advisory Content</div>;
      case "CropInformation":
        return <div>Crop Information Content</div>;
      case "SoilAnalysis":
        return <div></div>;
      case "FarmReport":
        return <div>Farm Report Content</div>;
      case "PersonaliseCropSchedule":
        return <div>Personalised Crop Schedule Content</div>;
      case "Settings":
        return <div>Settings Content</div>;
      default:
        return (
          <div>
            <div style={{ flex: 1 }}>
              <Card
                bodyStyle={{ padding: 0, margin: 0 }}
                style={{
                  width: "90%",
                  height: "400px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  margin: "30px auto",
                  overflow: "hidden",
                }}
              >
                <MapData style={{ width: "100%", height: "100%" }} />
              </Card>
            </div>

            <Card
              style={{
                width: "90%",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                margin: "30px auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  color: "#344E41",
                  fontSize: 20,
                  fontFamily: "Inter",
                  fontWeight: "700",
                }}
              >
                Crop Health
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "20px",
                }}
              >
                <div
                  style={{
                    border: "0.5px solid",
                    marginRight: "25px",
                    padding: 10,
                  }}
                >
                  <Rice />
                </div>

                <div
                  style={{
                    color: "#344E41",
                    fontSize: 20,
                    fontFamily: "Inter",
                    fontWeight: "600",
                  }}
                >
                  Crop Name: Wheat
                  <br />
                  Crop Age: 15 days
                  <br />
                  Standard Yield Data: 460.00 kg/acre
                  <br />
                  Total Area: 1.5 Acre
                </div>
              </div>
              <br />
              <div style={{ marginTop: "20px", paddingLeft: "" }}>
                <h3 style={{ color: "#344E41", fontWeight: "700" }}>
                  Soil Analysis
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      marginBottom: "20px",
                      display: "flex",
                      alignItems: "center",
                      width: "40%",
                    }}
                  >
                    <div
                      style={{
                        marginRight: "22px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          backgroundColor: "#B0E57C",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            color: "#FFF",
                            fontSize: "18px",
                            fontWeight: "bold",
                          }}
                        >
                          N
                        </span>
                      </div>
                      <p
                        style={{
                          margin: "5px 0 0 0",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      ></p>
                    </div>
                    <div
                      style={{
                        flexGrow: 1,
                        color: "#344E41",
                        fontFamily: "Inter",
                        fontWeight: "700",
                      }}
                    >
                      Nitrogen
                      <Progress
                        percent={80}
                        status="active"
                        showInfo={false}
                        strokeWidth={5}
                        strokeColor="#116B5F"
                        trailColor="transparent"
                      />
                      <Progress
                        percent={30}
                        status="active"
                        showInfo={false}
                        strokeWidth={5}
                        strokeColor="#116B5F"
                        trailColor="transparent"
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      marginBottom: "20px",
                      display: "flex",
                      alignItems: "center",
                      width: "50%",
                    }}
                  >
                    <div
                      style={{
                        marginRight: "10px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          backgroundColor: "#B0E57C",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            color: "#FFF",
                            fontSize: "18px",
                            fontWeight: "bold",
                          }}
                        >
                          P
                        </span>
                      </div>
                      <p
                        style={{
                          margin: "5px 0 0 0",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      ></p>
                    </div>
                    <div
                      style={{
                        flexGrow: 1,
                        color: "#344E41",
                        fontFamily: "Inter",
                        fontWeight: "700",
                        marginLeft: "10px",
                      }}
                    >
                      Phosphorus
                      <Progress
                        percent={60}
                        status="active"
                        showInfo={false}
                        strokeWidth={5}
                        strokeColor="#116B5F"
                        trailColor="transparent"
                      />
                      <Progress
                        percent={20}
                        status="active"
                        showInfo={false}
                        strokeWidth={5}
                        strokeColor="#116B5F"
                        trailColor="transparent"
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "40%",
                    }}
                  >
                    <div
                      style={{
                        marginRight: "20px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          backgroundColor: "#B0E57C",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            color: "#FFF",
                            fontSize: "18px",
                            fontWeight: "bold",
                          }}
                        >
                          K
                        </span>
                      </div>
                      <p
                        style={{
                          margin: "5px 0 0 0",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      ></p>
                    </div>
                    <div
                      style={{
                        flexGrow: 1,
                        color: "#344E41",
                        fontFamily: "Inter",
                        fontWeight: "700",
                      }}
                    >
                      Potassium
                      <Progress
                        percent={90}
                        status="active"
                        showInfo={false}
                        strokeWidth={5}
                        strokeColor="#116B5F"
                        trailColor="transparent"
                      />
                      <Progress
                        percent={40}
                        status="active"
                        showInfo={false}
                        strokeWidth={5}
                        strokeColor="#116B5F"
                        trailColor="transparent"
                      />
                    </div>
                  </div>
                </div>

                {/*Donut Chart*/}
                <div
                  style={{
                    position: "absolute",
                    top: "40px",
                    right: "20%",
                    width: "100px",
                    height: "100px",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      width: "140%",
                      height: "140%",
                    }}
                  >
                    <div style={{ position: "absolute", top: "10%" }}>
                      <PieChart
                        data={[
                          {
                            title: "Segment 1",
                            value: values[0],
                            color: segmentColors[0],
                          },
                          {
                            title: "Segment 2",
                            value: values[1] - values[0],
                            color: segmentColors[1],
                          },
                          {
                            title: "Segment 3",
                            value: values[2] - values[1],
                            color: segmentColors[2],
                          },
                        ]}
                        totalValue={values[2]}
                        lineWidth={30}
                        startAngle={270}
                        style={{ height: "100%" }}
                        className="pie-chart"
                        label={() => `${totalValue}%`}
                        labelStyle={{
                          fontSize: "20px",
                          fontFamily: "sans-serif",
                          fill: "#000",
                        }}
                        labelPosition={0}
                      />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: 50,
                    left: "85%",
                    width: "100px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "138px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "20px",
                          backgroundColor: segmentColors[0],
                          marginRight: "8px",
                        }}
                      ></div>
                      <span>{values[0]}%</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "20px",
                          backgroundColor: segmentColors[1],
                          marginRight: "8px",
                        }}
                      ></div>
                      <span>{values[1] - values[0]}%</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "20px",
                          backgroundColor: segmentColors[2],
                          marginRight: "8px",
                        }}
                      ></div>
                      <span>{values[2] - values[1]}%</span>
                    </div>
                  </div>

                  {/*Area chart*/}
                  <div
                    style={{
                      position: "absolute",
                      top: "220px",
                      right: "-20px",
                    }}
                  >
                    <h3 style={{ color: "#344E41", fontWeight: "700" }}>
                      Soil Health
                    </h3>
                    <ResponsiveContainer width={500} height={250}>
                      <AreaChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tick={false} />
                        <Tooltip />
                        <Legend />
                        {/* Areas under the lines with solid color */}
                        <Area
                          type="monotone"
                          dataKey="Line1"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.5}
                        />
                        <Area
                          type="monotone"
                          dataKey="Line2"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          fillOpacity={0.5}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </Card>

            <Card
              style={{
                width: "90%",
                height: "250px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                margin: "30px auto",
              }}
            >
              <div className="weather-container">
                <div className="forecast-wrapper">
                  {forecast.map(([day, data, date], index) => (
                    <div
                      className={`weather-day ${
                        index === 0 ? "current-day" : ""
                      }`}
                      key={index}
                      style={
                        index === 0
                          ? {
                              flexBasis: "5%",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }
                          : {}
                      }
                    >
                      <div style={{ textAlign: "center" }}>
                        <h3>{day}</h3>
                        <span>{date}</span>
                        <img
                          src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
                          alt={data.description}
                        />
                        <p>{data.description}</p>
                        <p>{Math.round((data.temp * 9) / 5 + 32)}°F</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card
              style={{
                width: "90%",
                height: "220px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                margin: "30px auto",
              }}
            >
              <div className="insights-container">
                <div
                  className="insights-header"
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>
                    Insights
                  </h2>
                  <h2
                    className="actions-header"
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      marginRight: "100px",
                    }}
                  >
                    Actions
                  </h2>
                </div>
                <ul
                  className="insights-list"
                  style={{ listStyle: "none", padding: "0" }}
                >
                  <li
                    className="insight-item"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "15px",
                      marginRight: "100px",
                    }}
                  >
                    <span
                      className="insight-text"
                      style={{
                        fontSize: "18px",
                        fontWeight: "500",
                        width: "80%",
                      }}
                    >
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </span>
                    <div
                      className="actions"
                      style={{ display: "flex", gap: "15px" }}
                    >
                      <button
                        className="accept-btn"
                        style={{
                          fontSize: "20px",
                          border: "2px solid",
                          borderRadius: "50%",
                          width: "30px",
                          height: "30px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "none",
                          cursor: "pointer",
                          color: "#28a745",
                        }}
                      >
                        &#10003;
                      </button>

                      <button
                        className="accept-btn"
                        style={{
                          fontSize: "20px",
                          border: "2px solid",
                          borderRadius: "50%",
                          width: "30px",
                          height: "30px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "none",
                          cursor: "pointer",
                          color: "#dc3545",
                        }}
                      >
                        &#10007;
                      </button>
                    </div>
                  </li>
                  <li
                    className="insight-item"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "15px",
                      marginRight: "100px",
                    }}
                  >
                    <span
                      className="insight-text"
                      style={{ fontSize: "18px", fontWeight: "500" }}
                    >
                      Sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua.
                    </span>
                    <div
                      className="actions"
                      style={{ display: "flex", gap: "15px" }}
                    >
                      <button
                        className="accept-btn"
                        style={{
                          fontSize: "20px",
                          border: "2px solid",
                          borderRadius: "50%",
                          width: "30px",
                          height: "30px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "none",
                          cursor: "pointer",
                          color: "#28a745",
                        }}
                      >
                        &#10003;
                      </button>

                      <button
                        className="accept-btn"
                        style={{
                          fontSize: "20px",
                          border: "2px solid",
                          borderRadius: "50%",
                          width: "30px",
                          height: "30px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "none",
                          cursor: "pointer",
                          color: "#dc3545",
                        }}
                      >
                        &#10007;
                      </button>
                    </div>
                  </li>
                  <li
                    className="insight-item"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginRight: "100px",
                    }}
                  >
                    <span
                      className="insight-text"
                      style={{ fontSize: "18px", fontWeight: "500" }}
                    >
                      Ut enim ad minim veniam, quis nostrud exercitation ullamco
                      laboris nisi ut aliquip ex ea commodo consequat.
                    </span>
                    <div
                      className="actions"
                      style={{ display: "flex", gap: "15px" }}
                    >
                      <button
                        className="accept-btn"
                        style={{
                          fontSize: "20px",
                          border: "2px solid",
                          borderRadius: "50%",
                          width: "30px",
                          height: "30px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "none",
                          cursor: "pointer",
                          color: "#28a745",
                        }}
                      >
                        &#10003;
                      </button>
                      <button
                        className="accept-btn"
                        style={{
                          fontSize: "20px",
                          border: "2px solid",
                          borderRadius: "50%",
                          width: "30px",
                          height: "30px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "none",
                          cursor: "pointer",
                          color: "#dc3545",
                        }}
                      >
                        &#10007;
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </Card>

            <Card
              style={{
                width: "90%",
                height: "350px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                margin: "30px auto",
              }}
            >
              <div className="crop-advisory-container">
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    color: "#344E41",
                  }}
                >
                  Crop Advisory
                </h2>
                <div
                  className="crop-advisory-wrapper"
                  style={{
                    display: "flex",
                    overflowX: "auto",
                    gap: "15px",
                    paddingBottom: "10px",
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                  }}
                >
                  <div className="crop-box">
                    <div
                      style={{
                        padding: "20px",
                        borderRadius: "10px",
                        minWidth: "250px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "20px",
                          marginBottom: "10px",
                          color: "#344E41",
                          fontWeight: 700,
                        }}
                      >
                        Seasonal Tips
                      </h3>
                      <p style={{ fontSize: "14px", marginBottom: "10px" }}>
                        1. Get seasonal recommendations based on your crop type
                        and local climate conditions. This includes planting
                        schedules, watering needs, and fertilization strategies.
                      </p>
                      <span style={{ cursor: "pointer" }}>Read More</span>
                    </div>
                  </div>
                  <div className="crop-box">
                    <div
                      style={{
                        padding: "20px",
                        borderRadius: "10px",
                        minWidth: "250px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "20px",
                          marginBottom: "10px",
                          color: "#344E41",
                          fontWeight: 700,
                        }}
                      >
                        Pest and Disease Alerts
                      </h3>
                      <p style={{ fontSize: "14px", marginBottom: "10px" }}>
                        2.Receive real-time alerts on potential pest
                        infestations and disease outbreaks in your area.
                        Suggested actions: "Aphid activity detected in your
                      </p>
                      <span style={{ cursor: "pointer" }}>Read More</span>
                    </div>
                  </div>
                  <div className="crop-box">
                    <div
                      style={{
                        padding: "20px",
                        borderRadius: "10px",
                        minWidth: "250px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "20px",
                          marginBottom: "10px",
                          color: "#344E41",
                          fontWeight: 700,
                        }}
                      >
                        Weather-Driven Advice
                      </h3>
                      <p style={{ fontSize: "14px", marginBottom: "10px" }}>
                        3. Stay informed about upcoming weather patterns that
                        may affect your crops. This includes frost warnings,
                        heavy rainfall alerts, and drought condition.
                      </p>
                      <span style={{ cursor: "pointer" }}>Read More</span>
                    </div>
                  </div>
                  <div className="crop-box">
                    <div
                      style={{
                        padding: "20px",
                        borderRadius: "10px",
                        minWidth: "250px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "20px",
                          marginBottom: "10px",
                          color: "#344E41",
                          fontWeight: 700,
                        }}
                      >
                        Nutrient Management
                      </h3>
                      <p style={{ fontSize: "14px", marginBottom: "10px" }}>
                        4. Get advice on nutrient management tailored to your
                        crop and soil conditions. Learn about the best practices
                        for soil testing and the right types of fertilizers to
                        use.
                      </p>
                      <span style={{ cursor: "pointer" }}>Read More</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card
              style={{
                width: "90%",
                height: "412px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                margin: "30px auto",
              }}
            >
              <PlantGrowthStagesCard />
            </Card>
          </div>
        );
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="Menubar"
        width={"17%"}
        collapsedWidth={80}
        style={{
          boxShadow: "2px 0 6px rgba(0, 21, 41, 0.08)",
        }}
      >
        <div
          className="profile"
          style={{ padding: "20px 0", textAlign: "center" }}
        >
          <div
            style={{
              padding: 15,
              borderRadius: 5,
              textAlign: "center",
              color: "#F8F8F8",
            }}
          >
            <img
              style={{
                width: !isMobile && !collapsed ? "100px" : "40px",
                height: "auto",
                borderRadius: "50%",
              }}
              src="https://avatar.iran.liara.run/public/boy?username=Ash"
              alt=""
            />

            {!isMobile && !collapsed && (
              <>
                <div
                  style={{ fontSize: 25, fontWeight: "600", marginTop: "20px" }}
                >
                  Mark Wood
                </div>
                <br />
                <div style={{ fontSize: 15, fontWeight: "600" }}>
                  markwood@gmail.com
                </div>
                <div style={{ fontSize: 15, fontWeight: "600" }}>Active</div>
              </>
            )}
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[]}
          onClick={({ key }) => handleMenuClick(key)}
        >
          {menuItems.map((item) => (
            <Menu.Item
              key={item.key}
              icon={item.icon}
              style={{
                paddingLeft: isMobile && collapsed ? "17px" : "20px",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {!collapsed && (
                <>
                  <span
                    style={{
                      marginLeft: isMobile && collapsed ? "none" : "20px",
                    }}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </Menu.Item>
          ))}
        </Menu>
        <Menu mode="inline" style={{ marginTop: "20vh", marginBottom: "10%" }}>
          <Menu.Item
            key="Logout"
            className="logout"
            icon={<L />}
            onClick={handleLogout}
            style={{
              paddingLeft: collapsed ? "24px" : "20px",
              position: "relative",
              top: isMobile ? "90px " : "0",
              topAlt: collapsed ? "710px" : "none",
            }}
          >
            {!isMobile && !collapsed && (
              <span
                style={{ marginLeft: "28%", fontSize: 14, fontWeight: "600" }}
              >
                Logout
              </span>
            )}
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <div style={{ flex: 1 }}>{renderContent()}</div>
      </Layout>
    </Layout>
  );
};

export default Navbar;
