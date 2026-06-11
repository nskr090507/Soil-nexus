// ─── DATA STORAGE FOR CHART ───
const chartLabels = [];
const moistureData = [];
const temperatureData = [];
const phData = [];

// ─── CREATE THE CHART ───
const ctx = document.getElementById('telemetryChart').getContext('2d');
const telemetryChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: chartLabels,
        datasets: [
            {
                label: 'Moisture %',
                data: moistureData,
                borderColor: '#4a90d9',
                backgroundColor: 'rgba(74,144,217,0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Temperature °C',
                data: temperatureData,
                borderColor: '#e67e22',
                backgroundColor: 'rgba(230,126,34,0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'pH Level',
                data: phData,
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46,204,113,0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    },
    options: {
        responsive: true,
        animation: { duration: 500 },
        scales: {
            y: { beginAtZero: false },
            x: { display: true }
        },
        plugins: {
            legend: { position: 'top' }
        }
    }
});

// ─── UPDATE CHART WITH NEW DATA ───
function updateChartInstance(newData) {
    // Get current time as label
    const now = new Date().toLocaleTimeString();
    chartLabels.push(now);
    moistureData.push(newData.moisture);
    temperatureData.push(newData.temperature);
    phData.push(newData.pH);

    // Keep only last 10 readings on chart
    if (chartLabels.length > 10) {
        chartLabels.shift();
        moistureData.shift();
        temperatureData.shift();
        phData.shift();
    }

    // Refresh the chart display
    telemetryChart.update();
}

// ─── FETCH LIVE DATA ───
function fetchLiveMetrics() {
    fetch('https://farmsense-backend.com/get_sensor_data')
        .then(response => response.json())
        .then(data => {
            hideNetworkAlert();
            updateDashboard(data);
            updateChartInstance(data);
        })
        .catch(error => showNetworkAlert("Offline - Reconnecting..."));

    // Fetch AI prediction
    fetch('https://farmsense-backend.com/predict_irrigation')
        .then(response => response.json())
        .then(data => showAIAdvice(data))
        .catch(error => console.log("AI not reachable yet"));
}

// ─── UPDATE SENSOR VALUES ON SCREEN ───
function updateDashboard(data) {
    document.getElementById('soil-moisture').innerText = data.moisture;
    document.getElementById('air-temp').innerText = data.temperature;
    document.getElementById('humidity').innerText = data.humidity;
    document.getElementById('ph-level').innerText = data.pH;
    checkMoistureAlert(data.moisture);
}

// ─── MOISTURE ALERT ───
function checkMoistureAlert(moisture) {
    const alertBox = document.getElementById('moisture-alert');
    if (moisture < 20) {
        alertBox.innerText = "🚨 CRITICAL: Activate Irrigation Systems Immediately!";
        alertBox.className = "alert-red";
        updateAdvisoryCard("critical");
    } else {
        alertBox.innerText = "✅ Soil Moisture Levels are Stable";
        alertBox.className = "alert-green";
        updateAdvisoryCard("stable");
    }
}

// ─── AI ADVISORY CARD ───
function showAIAdvice(data) {
    const box = document.getElementById('ai-recommendation');
    if (data.irrigation_required === 1) {
        box.innerText = "⚠️ Water Needed: Scheduled Irrigation Recommended";
        box.style.backgroundColor = "#d6eaf8";
        box.style.color = "#1a5276";
    } else {
        box.innerText = "✅ Soil Moisture Optimal: No Irrigation Required";
        box.style.backgroundColor = "#d5f5e3";
        box.style.color = "#1e8449";
    }
}

// ─── UPDATE AI ADVISORY PLACEHOLDER ───
function updateAdvisoryCard(status) {
    const ring = document.querySelector('.advisory-ring');
    const message = document.getElementById('advisory-message');
    if (status === "critical") {
        ring.className = "advisory-ring ring-critical";
        message.innerText = "🚨 Critical: Immediate irrigation required!";
    } else {
        ring.className = "advisory-ring ring-stable";
        message.innerText = "✅ Crops are healthy. No action needed.";
    }
}

// ─── NETWORK ALERTS ───
function showNetworkAlert(message) {
    const banner = document.getElementById('network-banner');
    const status = document.getElementById('system-status');
    banner.style.display = 'block';
    status.innerText = message;
}

function hideNetworkAlert() {
    document.getElementById('network-banner').style.display = 'none';
}

// ─── AUTO REFRESH EVERY 3 SECONDS ───
setInterval(fetchLiveMetrics, 3000);
fetchLiveMetrics();