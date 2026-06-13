# FarmSense AI — Backend Module

## 🔧 Tech Stack
- **Framework**: Flask (Python)
- **Database**: Firebase Realtime Database
- **ML Integration**: Scikit-Learn (joblib/pickle loaded models)
- **CORS**: flask-cors (allows frontend to access API)

## 📁 Folder Structure
/backend

├── app.py                  # Main Flask application

├── venv/                    # Python virtual environment (not pushed to GitHub)

├── serviceAccountKey.json   # Firebase credentials (DO NOT PUSH - in .gitignore)

├── irrigation_model.pkl     # ML model for irrigation prediction

└── requirements.txt         # Python dependencies
## ⚙️ Setup Instructions

### Step 1: Create Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate
```

### Step 2: Install Dependencies

```bash
pip install flask firebase-admin flask-cors scikit-learn joblib
```

### Step 3: Add Firebase Credentials

* Place your `serviceAccountKey.json` file inside `/backend`
* serviceAccountKey.json

*.json

.env
### Step 4: Run the Server

```bash
python app.py
```

Server runs at: `http://127.0.0.1:5000/`

---

## 🔌 API Endpoints

### 1. Health Check
Returns: `"FarmSense Server is Active!"`

### 2. Update Sensor Data (from ESP32)
**Returns:**

```json
{
    "moisture": 42,
    "temperature": 28.5,
    "humidity": 65,
    "pH": 6.8
}
```

### 4. Get AI Irrigation Prediction
**Returns:**

```json
{
    "irrigation_required": 1,
    "fertilizer_status": 0,
    "disease_risk": 0,
    "confidence_score": 0.89,
    "ai_advisory": "Soil moisture levels dropping. Schedule irrigation soon."
}
```

---

## 🗄️ Firebase Database Structure
FarmSense-AI (root)

├── current_reading

│   ├── moisture: 42

│   ├── temperature: 28.5

│   ├── humidity: 65

│   └── pH: 6.8

└── sensor_history

├── 1774889420

│   ├── moisture: 42

│   ├── temperature: 28.5

│   └── ...

└── ...
---

## 🤖 ML Model Integration

* Model file: `irrigation_model.pkl`
* Loaded on server startup:

```python
import joblib
model = joblib.load('irrigation_model.pkl')
```

* Used inside `/predict_irrigation` route to generate predictions from live sensor data

---

## 🌐 Cloud Deployment

* Hosted on: AWS Free Tier / PythonAnywhere
* WSGI Server: Gunicorn
* Update `config.py` to switch between local and production:

```python
import os
if os.environ.get('ENV') == 'PRODUCTION':
    API_URL = "https://farmsense-backend.com"
else:
    API_URL = "http://127.0.0.1:5000"
```

---

## 🔒 Environment Variables (GitHub Secrets)

Stored under **Repo Settings > Secrets and Variables > Actions**:

* `FIREBASE_API_KEY`
* `AWS_ACCESS_KEY_ID`

---

## ⚠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` |
| Firebase connection error | Check `serviceAccountKey.json` path and validity |
| CORS error in browser | Ensure `CORS(app)` is initialized in `app.py` |
| Model not loading | Verify `irrigation_model.pkl` exists in `/backend` |
| Response time > 3s | Check Firebase region, optimize model inference |

---

## 📊 Data Flow
ESP32 → POST /update_sensor → Firebase (current_reading + sensor_history)

↓

ML Model (irrigation_model.pkl)

↓

GET /predict_irrigation → Frontend Dashboard
* This file is **secret** — never commit it to GitHub
* Make sure `.gitignore` contains:
