
function fetchLiveMetrics() {
    fetch('https://farmsense-backend.com/get_sensor_data')
        .then(response => response.json())
         .then(data => {
    hideNetworkAlert();
    updateDashboard(data);
})
        .catch(error => showNetworkAlert("Offline - Reconnecting..."));
}

// Update all sensor values on screen
function updateDashboard(data) {
    document.getElementById('soil-moisture').innerText = data.moisture;
    document.getElementById('air-temp').innerText = data.temperature;
    document.getElementById('humidity').innerText = data.humidity;
    document.getElementById('ph-level').innerText = data.pH;

    // Check moisture level and show alert
    checkMoistureAlert(data.moisture);
}
// Check moisture and show red or green alert
function checkMoistureAlert(moisture) {
    const alertBox = document.getElementById('moisture-alert');
    if (moisture < 20) {
        alertBox.innerText = "🚨 CRITICAL: Activate Irrigation Systems Immediately!";
        alertBox.className = "alert-red";
    } else {
        alertBox.innerText = "✅ Soil Moisture Levels are Stable";
        alertBox.className = "alert-green";
    }
}
// Show offline banner when connection drops
function showNetworkAlert(message) {
    const banner = document.getElementById('network-banner');
    const status = document.getElementById('system-status');
    banner.style.display = 'block';
    status.innerText = message;
}

// Hide banner when connection is back
function hideNetworkAlert() {
    document.getElementById('network-banner').style.display = 'none';
}
// Auto refresh every 3 seconds
setInterval(fetchLiveMetrics, 3000);
fetchLiveMetrics();