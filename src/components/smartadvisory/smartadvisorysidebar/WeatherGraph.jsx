import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Bar,
  Line,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const data = [
  { date: "20 Jul", precipitation: 20, maxTemp: 25, minTemp: 12 },
  { date: "21 Jul", precipitation: 15, maxTemp: 24, minTemp: 14 },
  { date: "22 Jul", precipitation: 30, maxTemp: 26, minTemp: 16 },
  { date: "23 Jul", precipitation: 22, maxTemp: 27, minTemp: 18 },
  { date: "24 Jul", precipitation: 18, maxTemp: 28, minTemp: 20 },
  { date: "25 Jul", precipitation: 12, maxTemp: 26, minTemp: 19 },
];

const WeatherGraph = () => {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis yAxisId="left" domain={[-30, 30]} tick={{ fontSize: 10 }} />
        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 10 }} />
        <Bar yAxisId="right" dataKey="precipitation" barSize={10} fill="#2ecc71" />
        <Line yAxisId="left" type="monotone" dataKey="maxTemp" stroke="#e74c3c" strokeWidth={2} dot={false} />
        <Line yAxisId="left" type="monotone" dataKey="minTemp" stroke="#3498db" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default WeatherGraph;
