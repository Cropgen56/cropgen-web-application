import WeatherGraph from "./WeatherGraph";
import img2 from "../../../assets/image/Frame 267.png"

const WeatherCard = () => {
  return (
    <div className="bg-[#344e41] rounded-lg p-4 text-white w-full shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-[24px]">Weather</h2>
        <img className=" w-[30px]" src={img2} alt="" />
      </div>

      <div className="bg-white rounded-md mt-3">
        <WeatherGraph />
      </div>

      <div className="bg-white text-black mt-4 rounded-md px-3 py-2 flex flex-wrap justify-between items-center text-sm font-medium gap-2">
        <span>☀️ Today <span className="font-semibold ml-1">27°C</span></span>
        <span>💨 14km/hr</span>
        <span>💧 86%</span>
        <span>🌡 1007hpa</span>
      </div>
    </div>

  );
};

export default WeatherCard;
