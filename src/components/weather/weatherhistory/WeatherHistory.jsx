import { Card } from "react-bootstrap";

const WeatherHistory = () => {
  return (
    <Card className="mt-3 mx-2 rounded-lg shadow-md bg-white">
      <Card.Body className="flex flex-col">
        <h2 className="w-heading text-[20px] font-bold text-[#344e41]">Weather History</h2>
        <div className="flex gap-3 mt-4">
          <div className="flex flex-col gap-2 mt-2">
            <div className="subtext text-[12px] text-gray-400 font-bold">Start Date</div>
            <input
              type="date"
              className="text-[12px] w-[150px] font-medium border border-gray-300 rounded px-2 py-[3px] focus:outline-none focus:ring-1 focus:ring-blue-400"
              style={{ color: "transparent" }}
              onFocus={(e) => {
                if (e.target.value) e.target.style.color = "black";
              }}
              onChange={(e) => {
                e.target.style.color = e.target.value ? "black" : "transparent";
              }}
            />
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <div className="subtext text-[12px] text-gray-400 font-bold">End Date</div>
            <input
              type="date"
              className="text-[12px] w-[150px] font-medium border border-gray-300 rounded px-2 py-[3px] focus:outline-none focus:ring-1 focus:ring-blue-400"
              style={{ color: "transparent" }}
              onFocus={(e) => {
                if (e.target.value) e.target.style.color = "black";
              }}
              onChange={(e) => {
                e.target.style.color = e.target.value ? "black" : "transparent";
              }}
            />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default WeatherHistory;
