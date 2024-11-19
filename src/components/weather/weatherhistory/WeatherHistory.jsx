import { Card } from "react-bootstrap";
import "./WeatherHistory.css";
const WeatherHistory = () => {
  return (
    <Card className="weather-history">
      <Card.Body>
        <h2 className="w-heading">Weather History</h2>
        <div className="subtext">Period</div>
      </Card.Body>
    </Card>
  );
};

export default WeatherHistory;
