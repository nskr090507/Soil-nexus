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
* This file is **secret** — never commit it to GitHub
* Make sure `.gitignore` contains:
