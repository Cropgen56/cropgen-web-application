# 🌾 CropGen – AI-Powered Satellite-Based Crop Monitoring Platform

**CropGen** is an advanced, AI-powered agricultural intelligence platform designed to revolutionize farm management and crop monitoring using satellite data, geospatial analytics, and real-time weather insights. By integrating **Copernicus Sentinel satellite data**, **AI models**, and **interactive GIS tools**, CropGen empowers farmers, agronomists, and agri-businesses to make data-driven decisions for sustainable and productive farming.

---

## 🚀 Key Features

### 🛰️ Satellite-Based Crop Monitoring
- Utilizes **Sentinel-2 satellite imagery** from **Copernicus Open Access Hub** and **AWS Open Data Registry**.
- NDVI and other vegetation indices for crop health assessment.
- Multi-temporal analysis for detecting changes in crop stages and stress zones.

### 🤖 AI-Powered Analytics
- Machine Learning models trained on historical geospatial and agronomic data.
- Predictive analytics for:
  - Crop yield estimation.
  - Crop classification.
  - Disease/stress zone detection.

### 🗺️ Geospatial Mapping & Tools
- Interactive farm boundary drawing and management using **Leaflet**.
- Integration with **Esri Leaflet**, **Turf.js**, **Geosearch**, and **Geocoder** APIs.
- Real-time weather overlays and soil moisture data using **OpenWeatherMap**.

### 📊 Visual Dashboards & Reports
- Real-time data visualization using **Chart.js**, **Recharts**, **Plotly**, and **ECharts**.
- Export insights as PDF reports with **jsPDF** and **html2canvas**.
- Support for interactive calendars using **FullCalendar** and scheduling tools.

### 📱 Modern Web UI
- Responsive and mobile-friendly design using **React**, **Tailwind CSS**, **Ant Design**, and **Bootstrap**.
- Advanced form handling with **React Hook Form**, multilingual support, and user-friendly data inputs.

---

## ⚙️ Tech Stack

| Layer             | Technology                                                                 |
|------------------|-----------------------------------------------------------------------------|
| **Frontend**      | React, React Router, Redux Toolkit, Tailwind CSS, Bootstrap, Ant Design     |
| **Mapping**       | Leaflet, React Leaflet, Esri Leaflet, Turf.js, Leaflet-Geosearch            |
| **Charts/Graphs** | Chart.js, Recharts, ECharts, Plotly, Circular Progress, Calendar (FullCalendar) |
| **AI/ML & Geo**   | Sentinel Satellite Data (Copernicus & AWS), Custom Python ML models (API integrated) |
| **Weather & APIs**| OpenWeatherMap, React Open Weather, Google Maps API                         |
| **Utilities**     | Axios, dotenv, html2canvas, jsPDF, idb-keyval                               |

---

## 🌐 Data Sources

- **Copernicus Sentinel-2 Data**
  - Official: [https://www.copernicus.eu/en/access-data](https://www.copernicus.eu/en/access-data)
  - AWS Open Data: [https://registry.opendata.aws/sentinel-2/](https://registry.opendata.aws/sentinel-2/)
- Weather API: OpenWeatherMap
- GIS APIs: Google Maps, Leaflet plugins

---

## 🧭 How It Works

1. **User defines farm boundary** via an interactive Leaflet map.
2. **Sentinel data** is fetched from AWS or Copernicus APIs.
3. Pre-processed images and bands are sent to **AI model** APIs for analysis.
4. Results are visualized as:
   - Crop health indices (NDVI, EVI)
   - Yield predictions and alerts
   - Time-series charts and heatmaps
5. Reports are downloadable and exportable as PDFs or images.

---

## 📦 Setup & Development

### Prerequisites

- Node.js (v18+)
- npm (v10+)
- .env file with API keys and service URLs

### Install Dependencies

```bash
npm install
