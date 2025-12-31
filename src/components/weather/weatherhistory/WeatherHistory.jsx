import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Button, Spinner, Alert } from "react-bootstrap";
import { fetchHistoricalWeather } from "../../../redux/slices/weatherSlice";
import CustomDatePicker from "../CustomDatePicker";
import { message } from "antd";

const WeatherHistory = ({
  selectedField,
  forecastData,
  onHistoricalDataReceived,
  onClearHistoricalData,
}) => {
  const dispatch = useDispatch();

  const aois = useSelector((state) => state.weather.aois);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geometryId, setGeometryId] = useState(null);

  useEffect(() => {
    if (selectedField && aois && aois.length > 0) {
      const matchingAOI = aois.find((aoi) => aoi.name === selectedField._id);

      if (matchingAOI && matchingAOI.id) {
        setGeometryId(matchingAOI.id);
        setError(null);
      } else {
        setGeometryId(null);
      }
    }
  }, [selectedField, aois]);

  const handleFetchWeather = async () => {
    if (!startDate || !endDate) {
      message.error("Please select both start and end dates");
      return;
    }

    if (!geometryId) {
      message.error(
        "Waiting for AOI to be created. Please try again in a moment."
      );
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      message.error("Start date must be before end date");
      return;
    }

    if (new Date(endDate) > new Date()) {
      message.error("End date cannot be in the future");
      return;
    }

    setLoading(true);
    setError(null);

    const requestPayload = {
      geometry_id: geometryId,
      start_date: startDate,
      end_date: endDate,
    };

    try {
      const resultAction = await dispatch(
        fetchHistoricalWeather(requestPayload)
      );

      if (fetchHistoricalWeather.fulfilled.match(resultAction)) {
        setWeatherData(resultAction.payload);

        if (onHistoricalDataReceived && resultAction.payload?.daily) {
          onHistoricalDataReceived(
            resultAction.payload.daily,
            startDate,
            endDate
          );
        }
      } else {
        if (resultAction.payload?.detail) {
          message.error(resultAction.payload.detail);
        } else if (resultAction.payload?.error) {
          message.error(resultAction.payload.error);
        } else {
          message.error("Failed to fetch weather data");
        }
      }
    } catch (err) {
      message.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const handleShowForecast = () => {
    setStartDate("");
    setEndDate("");
    setWeatherData(null);
    if (onClearHistoricalData) {
      onClearHistoricalData();
    }
  };

  return (
    <Card className="mt-3 mx-2 rounded-lg shadow-md bg-white z-[500]">
      <Card.Body className="flex flex-col">
        <h2 className="w-heading text-[20px] font-bold text-[#344e41]">
          Weather History
        </h2>

        {selectedField && (
          <div className="text-xs text-gray-500 mt-1">
            Field: {selectedField.fieldName || selectedField.farmName}
          </div>
        )}

        {error && (
          <Alert
            variant="danger"
            className="mt-2 text-sm"
            onClose={() => setError(null)}
            dismissible
          >
            {error}
          </Alert>
        )}

        {/* <div className="flex gap-3 mt-4">
          <div className="flex flex-col gap-2 mt-2">
            <div className="subtext text-[12px] text-gray-400 font-bold">
              Start Date
            </div>
            <input
              type="date"
              value={startDate}
              className="date-white text-white bg-[#344E41] text-[12px] w-[150px] font-medium border border-gray-300 rounded px-2 py-[3px] focus:outline-none focus:ring-1 focus:ring-blue-400"
              onChange={(e) => {
                setStartDate(e.target.value);
                setError(null);
              }}
            />
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <div className="subtext text-[12px] text-gray-400 font-bold">
              End Date
            </div>
            <input
              type="date"
              value={endDate}
              className="date-white text-white bg-[#344E41] text-[12px] w-[150px] font-medium border border-gray-300 rounded px-2 py-[3px] focus:outline-none focus:ring-1 focus:ring-blue-400"
              onChange={(e) => {
                setEndDate(e.target.value);
                setError(null);
              }}
            />
          </div>
        </div> */}

        <div className="flex gap-3 mt-4">
          <div className="flex flex-col gap-2 mt-2 w-[150px]">
            <CustomDatePicker
              label="Start Date"
              value={startDate}
              onChange={(date) => {
                setStartDate(date);
                setError(null);
              }}
              placeholder="Select start date"
              maxDate={today}
            />
          </div>

          <div className="flex flex-col gap-2 mt-2 w-[150px]">
            <CustomDatePicker
              label="End Date"
              value={endDate}
              onChange={(date) => {
                setEndDate(date);
                setError(null);
              }}
              placeholder="Select end date"
              maxDate={today}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            variant="primary"
            className="w-[150px]"
            onClick={handleFetchWeather}
            disabled={loading || !startDate || !endDate || !geometryId}
            style={{ backgroundColor: "#344e41", borderColor: "#344e41" }}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Loading...
              </>
            ) : (
              "Get Weather"
            )}
          </Button>

          {weatherData && (
            <Button
              variant="secondary"
              className="w-[150px]"
              onClick={handleShowForecast}
            >
              Show Forecast
            </Button>
          )}
        </div>

        {!geometryId && selectedField && (
          <div className="text-xs text-orange-600 mt-2">
            Creating AOI for this field. Please wait...
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default WeatherHistory;
