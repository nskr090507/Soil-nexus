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
// ─── OFFLINE DEMO MODE ───
let demoMode = false;

function loadDemoData() {
    fetch('mock_demo_data.json')
        .then(response => response.json())
        .then(mock => {
            hideNetworkAlert();
            updateDashboard(mock.sensor_data);
            updateChartInstance(mock.sensor_data);
            document.getElementById('ph-reading').innerText = mock.sensor_data.pH;
            document.getElementById('humidity-reading').innerText = mock.sensor_data.humidity;

            showAIAdvice(mock.prediction);
            updateAdvisoryMessage(mock.prediction);
            checkDiseaseWarning(mock.prediction);

            const pct = (mock.prediction.confidence_score * 100).toFixed(1);
            document.getElementById('confidence-badge').innerText = pct + '%';
            document.getElementById('confidence-score-display').innerText = pct + '%';
        });
}

// ─── UPDATE CHART ───
function updateChartInstance(newData) {
    const now = new Date().toLocaleTimeString();
    chartLabels.push(now);
    moistureData.push(newData.moisture);
    temperatureData.push(newData.temperature);
    phData.push(newData.pH);

    if (chartLabels.length > 10) {
        chartLabels.shift();
        moistureData.shift();
        temperatureData.shift();
        phData.shift();
    }
    telemetryChart.update();
}

// ─── FETCH LIVE DATA WITH SPEED TRACKING ───
function fetchLiveMetrics() {
    const startTime = Date.now();

    fetch('https://farmsense-backend.com/get_sensor_data')
        .then(response => response.json())
        .then(data => {
            hideNetworkAlert();

            // Calculate network speed
            const responseTime = Date.now() - startTime;
            trackNetworkSpeed(responseTime);

            updateDashboard(data);
            updateChartInstance(data);

            // Parse complex payload fields
            document.getElementById('ph-reading').innerText = data.pH || '--';
            document.getElementById('humidity-reading').innerText = data.humidity || '--';
        })
        .catch(error => handleNetworkTimeout());

     // Fetch AI prediction
    fetch('https://farmsense-backend.com/predict_irrigation')
        .then(response => response.json())
        .then(data => {
            showAIAdvice(data);
            updateAdvisoryMessage(data);
            checkDiseaseWarning(data);

            if (data.confidence_score !== undefined) {
                const pct = (data.confidence_score * 100).toFixed(1);
                document.getElementById('confidence-badge').innerText = pct + '%';
                document.getElementById('confidence-score-display').innerText = pct + '%';
            }
        })
         .catch(error => handleNetworkTimeout());
    }
// ─── UPDATE SENSOR VALUES ───
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
        updateAdvisoryUrgency("high");
    } else {
        alertBox.innerText = "✅ Soil Moisture Levels are Stable";
        alertBox.className = "alert-green";
        updateAdvisoryUrgency("healthy");
    }
}

// ─── UPDATE ADVISORY URGENCY BADGE ───
function updateAdvisoryUrgency(level) {
    const badge = document.getElementById('advisory-urgency-badge');
    if (level === "high") {
        badge.innerText = "🔴 High Priority - Immediate Action Required";
        badge.className = "urgency-high";
    } else {
        badge.innerText = "🟢 Healthy Status - Crops Are Fine";
        badge.className = "urgency-healthy";
    }
}

// ─── AI ADVICE ───
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
// ─── DYNAMIC ADVISORY MESSAGE ───
function updateAdvisoryMessage(data) {
    const msg = document.getElementById('advisory-message-text');
    if (data.irrigation_required === 1) {
        msg.innerText = "Advisory: Soil moisture levels dropping. Schedule irrigation within the next 2 hours.";
    } else {
        msg.innerText = "Advisory: Soil condition optimal. No watering needed.";
    }

    // Fertilizer status (if backend sends it)
    if (data.fertilizer_status !== undefined) {
        if (data.fertilizer_status === 1) {
            msg.innerText += " Fertilizer application recommended this week.";
        } else {
            msg.innerText += " Fertilizer levels are sufficient.";
        }
    }
}
// ─── DISEASE WARNING CHECK ───
function checkDiseaseWarning(data) {
    const tag = document.getElementById('disease-warning-tag');
    const statusLight = document.querySelector('.status-light');

    // Example threshold: high humidity + high temp = disease risk
    if (data.disease_risk === 1) {
        tag.classList.remove('hidden');
        statusLight.style.backgroundColor = '#e74c3c'; // red alert
    } else {
        tag.classList.add('hidden');
        statusLight.style.backgroundColor = '#2ecc71'; // green safe
    }
}
 // ─── NETWORK SPEED TRACKER ───
function trackNetworkSpeed(responseTime) {
    const speedDisplay = document.getElementById('network-speed');
    speedDisplay.innerText = responseTime + 'ms';
    if (responseTime > 3000) {
        speedDisplay.className = "speed-slow";
        document.getElementById('network-speed').title = "⚠️ Slow connection detected";
    } else {
        speedDisplay.className = "speed-normal";
    }
    adjustPollingSpeed(responseTime);
}
 
 // ─── NETWORK BANNER / ERROR HANDLING ───
function showNetworkAlert(message) {
    const banner = document.getElementById('network-banner');
    const status = document.getElementById('system-status');
    banner.style.display = 'block';
    status.innerText = message || "Offline - Reconnecting to FarmSense Network...";
}

function hideNetworkAlert() {
    document.getElementById('network-banner').style.display = 'none';
}

// ─── TIMEOUT HANDLER ───
function handleNetworkTimeout() {
    showNetworkAlert("Offline - Reconnecting to FarmSense Network...");
}
// ─── TOGGLE CHART VISIBILITY ───
document.getElementById('toggle-chart-btn').addEventListener('click', function() {
    const canvas = document.getElementById('telemetryChart');
    if (canvas.style.display === 'none') {
        canvas.style.display = 'block';
        this.innerText = 'Hide Chart';
    } else {
        canvas.style.display = 'none';
        this.innerText = 'Show Chart';
    }
});
// ─── DEMO MODE TOGGLE ───
document.getElementById('demo-mode-btn').addEventListener('click', function() {
    demoMode = !demoMode;
    if (demoMode) {
        this.innerText = 'Disable Demo Mode';
        clearInterval(pollTimer);
        loadDemoData();
        pollTimer = setInterval(loadDemoData, 3000);
    } else {
        this.innerText = 'Enable Demo Mode';
        clearInterval(pollTimer);
        pollTimer = setInterval(fetchLiveMetrics, pollInterval);
        fetchLiveMetrics();
    }
});
// ─── AUTO REFRESH EVERY 3 SECONDS ───//  
// // ─── ADAPTIVE POLLING FOR SLOW NETWORKS ───
let pollInterval = 3000;
let pollTimer = setInterval(fetchLiveMetrics, pollInterval);

function adjustPollingSpeed(responseTime) {
    // If network is slow, poll less frequently to save data
    if (responseTime > 3000 && pollInterval !== 6000) {
        clearInterval(pollTimer);
        pollInterval = 6000;
        pollTimer = setInterval(fetchLiveMetrics, pollInterval);
    } else if (responseTime <= 3000 && pollInterval !== 3000) {
        clearInterval(pollTimer);
        pollInterval = 3000;
        pollTimer = setInterval(fetchLiveMetrics, pollInterval);
    }
}
fetchLiveMetrics();