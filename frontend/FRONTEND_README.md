# FarmSense AI — Frontend Dashboard

## 📁 Files
- `index.html` — Main dashboard structure
- `style.css` — All styling, including mobile responsive rules
- `app.js` — Live data fetching, chart rendering, AI advisory logic
- `mock_demo_data.json` — Offline demo data for presentations

## 🔌 Backend Endpoints Used
- `GET /get_sensor_data` — Returns moisture, temperature, humidity, pH
- `GET /predict_irrigation` — Returns AI prediction (irrigation, fertilizer, disease risk, confidence)

## 🚀 How to Run Locally
1. Open this folder in VS Code
2. Right-click `index.html` → "Open with Live Server"
3. Dashboard opens automatically in your browser

## 🎮 Demo Mode
Click **"Enable Demo Mode"** to load sample data from `mock_demo_data.json` 
without needing a live backend connection — perfect for presentations.

## 📱 Mobile Support
Dashboard is fully responsive down to 360px width (small smartphones).

## 📊 Features
- Real-time sensor metrics (moisture, temp, humidity, pH)
- Live trend chart (Chart.js)
- AI Crop Advisory with confidence score
- Disease risk warning indicator
- Network speed monitor with adaptive polling
- Offline/error banner