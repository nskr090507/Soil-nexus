from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, db

# ==========================================
# 1. INITIALIZATION & SECURITY (Week 1 & Week 2 Day 4)
# ==========================================

app = Flask(__name__)

# Enable CORS so frontend browsers can talk to your backend safely
CORS(app)

# Initialize Firebase Admin SDK using your private key file
# CRUCIAL: Make sure 'your-firebase-adminsdk-key.json' is saved in this exact folder!
cred = credentials.Certificate("farmsense-ai-a40c6-firebase-adminsdk-fbsvc-3128cf3f4e.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://farmsense-ai-a40c6-default-rtdb.asia-southeast1.firebasedatabase.app/'
})


# ==========================================
# 2. THE LOCAL DEVICE INTAKE ROUTE (Week 2 Day 2 & Day 3)
# ==========================================

@app.route('/update_sensor', methods=['POST'])
def update_sensor():
    """
    This endpoint listens for incoming data packets sent over the Wi-Fi 
    by Team Member 2's ESP32 hardware device.
    """
    try:
        # Extract the JSON payload sent by the ESP32
        data = request.get_json()
        
        # Validation Check: Ensure data isn't completely blank
        if not data:
            return jsonify({"status": "error", "message": "No data received"}), 400
            
        moisture = data.get('moisture')
        ph = data.get('pH')
        
        # Validation Check: Ensure both expected parameters actually exist
        if moisture is None or ph is None:
            return jsonify({"status": "error", "message": "Missing required fields: moisture or pH"}), 400
            
        # --- Safety Validations (Day 3) ---
        # Ensure moisture falls within a clean percentage window
        if not (0 <= moisture <= 100):
            return jsonify({"status": "error", "message": "Out of bounds! Moisture must be between 0% and 100%"}), 400
            
        # Ensure pH stays mathematically bounded within standard ranges
        if not (0 <= ph <= 14):
            return jsonify({"status": "error", "message": "Out of bounds! pH parameters must scale between 0 and 14"}), 400

        # If data passes safety checks, write it directly to the Cloud Database
        ref = db.reference('current_reading')
        ref.set({
            'moisture': float(moisture),
            'pH': float(ph)
        })
        
        # Log to your local terminal console for verification testing
        print(f"✅ Live Stream Synced -> Moisture: {moisture}%, pH: {ph}")
        
        return jsonify({"status": "success", "message": "Data securely processed and pushed to Firebase!"}), 200

    except Exception as e:
        # Prevent server crashes by catching runtime errors safely
        print(f"❌ Internal Processing Error: {str(e)}")
        return jsonify({"status": "error", "message": f"Pipeline broken: {str(e)}"}), 500


# ==========================================
# 3. THE FRONTEND FETCH ROUTE (Week 2 Day 1)
# ==========================================

@app.route('/get_sensor_data', methods=['GET'])
def get_sensor_data():
    """
    This endpoint acts as the read path link for Team Member 5's 
    visual dashboard UI screen to display live numbers.
    """
    try:
        # Read the latest structural node from Firebase
        ref = db.reference('current_reading')
        latest_data = ref.get()
        
        # If database is completely empty, send a default structure layout
        if latest_data is None:
            return jsonify({"moisture": 0.0, "pH": 7.0}), 200
            
        return jsonify(latest_data), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": f"Could not retrieve records: {str(e)}"}), 500


# ==========================================
# 4. SERVER RUNNER (Bulletproof Local Network Boot)
# ==========================================

if __name__ == '__main__':
    # Binds server directly to port 5000 and exposes it globally across local Wi-Fi routing paths
    app.run(host='0.0.0.0', port=5000, debug=True)