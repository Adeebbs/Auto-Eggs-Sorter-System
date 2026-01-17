// === Configuration ===
const API_URL = 'https://script.google.com/macros/s/AKfycbzrmjSFV-U6VYkNCk1WUXEAq0hrH0ruUeZxykv_zyKD3bDudetkChwLAkzrTUFkzcugbg/exec';
// IMPORTANT: For testing purposes, since we don't have real historical data flowing in today,
// we fix the "current date" to match your designs.
// IN PRODUCTION: change this to: const NOW = new Date();
const REFERENCE_NOW = new Date('2026-01-18T17:35:26+08:00'); 

// Global state to hold fetched data
let appState = {
    currentView: 'dashboard',
    data: null,
    lastUpdated: null
};

// === DOM Elements ===
const contentArea = document.getElementById('content-area');
const navItems = document.querySelectorAll('.nav-item');
const dateDisplay = document.getElementById('malaysia-date');
const timeDisplay = document.getElementById('malaysia-time');

// === HTML Templates (Views) ===
const views = {
    dashboard: `
        <div class="animate-in">
            <h2 class="page-title"><i class="fas fa-home"></i> Dashboard</h2>
            <div class="dashboard-banner">
                <div class="banner-content">
                    <h2>Welcome back!</h2>
                    <h1>Auto Egg Sorter Control Dashboard</h1>
                    <p>Manage and monitor your egg sorting system efficiently.</p>
                </div>
            </div>
            <div class="dashboard-info">
                Smart Automation Meets Poultry Management Our Auto Egg Sorter system is designed to bridge the gap between manual labor and industrial efficiency. By integrating high-speed sensors and intelligent software.
            </div>
        </div>
    `,
    'pico-system-info': `
        <div class="animate-in">
             <h2 class="page-title"><i class="fas fa-robot"></i> PICO System Info</h2>
             <div class="pico-grid">
                <div class="pico-card">
                    <h3>CPU USAGE</h3>
                    <div class="pico-value" id="pico-cpu">--%</div>
                </div>
                <div class="pico-card">
                    <h3>MEMORY USAGE</h3>
                    <div class="pico-value" id="pico-memory">--%</div>
                </div>
                <div class="pico-card">
                    <h3>PICO TEMPERATURE</h3>
                    <div class="pico-value" id="pico-temp">--°C</div>
                </div>
            </div>
            <div class="pico-grid" style="grid-template-columns: 1fr 1fr;">
                <div class="pico-card">
                    <h3>TIME</h3>
                    <div class="pico-value" id="pico-time">--:--:-- PM</div>
                </div>
                <div class="pico-card">
                    <h3>LOCATION</h3>
                    <div class="pico-value" id="pico-location">--</div>
                </div>
             </div>
        </div>
    `,
   'eggs-info': `
        <div class="animate-in">
            <h2 class="page-title">
                <i class="fas fa-egg"></i> Eggs Info
            </h2>
            
            <div class="summary-cards-grid">
                <div class="summary-card">
                    <div class="summary-card-header">DAILY TOTAL EGGS</div>
                    <div class="summary-card-value" id="daily-total">0</div>
                </div>
                <div class="summary-card">
                    <div class="summary-card-header">DAILY REJECTED EGGS</div>
                    <div class="summary-card-value" id="daily-rejected">0</div>
                </div>
                <div class="summary-card">
                    <div class="summary-card-header">DAILY AVG WEIGHT</div>
                    <div class="summary-card-value" id="daily-avg-weight">0.0 g</div>
                </div>
                <div class="summary-card" style="background: transparent; border: none;"></div>
            </div>

             <div class="summary-cards-grid">
                 <div class="summary-card">
                    <div class="summary-card-header">GRADE A</div>
                    <div class="summary-card-value" id="daily-grade-a">0</div>
                </div>
                <div class="summary-card">
                    <div class="summary-card-header">GRADE B</div>
                    <div class="summary-card-value" id="daily-grade-b">0</div>
                </div>
                <div class="summary-card">
                    <div class="summary-card-header">GRADE C</div>
                    <div class="summary-card-value" id="daily-grade-c">0</div>
                </div>
                <div class="summary-card">
                    <div class="summary-card-header">GRADE D</div>
                    <div class="summary-card-value" id="daily-grade-d">0</div>
                </div>
             </div>

            <div class="tables-grid">
                <div class="summary-table-container">
                    <div class="table-header">DAILY SUMMARY</div>
                    <table class="styled-table">
                        <thead>
                            <tr>
                                <th>GRADE</th>
                                <th>TOTAL EGGS</th>
                                <th>TOTAL REJECTED</th>
                            </tr>
                        </thead>
                        <tbody id="daily-table-body">
                            </tbody>
                    </table>
                </div>

                <div class="summary-table-container">
                    <div class="table-header">WEEKLY SUMMARY</div>
                    <table class="styled-table">
                        <thead>
                            <tr>
                                <th>GRADE</th>
                                <th>TOTAL EGGS</th>
                                <th>TOTAL REJECTED</th>
                            </tr>
                        </thead>
                        <tbody id="weekly-table-body">
                             </tbody>
                    </table>
                </div>

                 <div class="summary-table-container">
                    <div class="table-header">MONTHLY SUMMARY</div>
                    <table class="styled-table">
                        <thead>
                            <tr>
                                <th>GRADE</th>
                                <th>TOTAL EGGS</th>
                                <th>TOTAL REJECTED</th>
                            </tr>
                        </thead>
                        <tbody id="monthly-table-body">
                             </tbody>
                    </table>
                </div>
            </div>
        </div>
    `,
    'system-log': `
        <div class="animate-in">
            <h2 class="page-title"><i class="fas fa-clipboard-list"></i> System Log</h2>
            
             <div class="log-table-container">
                <h3>LIVE SYSTEM LOG (Last 20 Events)</h3>
                <br>
                <table class="log-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Egg ID</th>
                            <th>Weight (g)</th>
                            <th>Grade</th>
                            <th>Event</th>
                        </tr>
                    </thead>
                    <tbody id="log-table-body">
                        <tr><td colspan="5">Loading logs...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `
};


// === Initialization & Routing ===
function init() {
    setupNavigation();
    startMalaysiaClock();
    loadView(appState.currentView);
    
    // Initial data fetch immediately
    fetchData();
    // Schedule fetch every second (1000ms)
    setInterval(fetchData, 1000);
}

function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const targetView = e.currentTarget.getAttribute('data-target');
            if (targetView !== appState.currentView) {
                loadView(targetView);
            }
        });
    });
}

function loadView(viewName) {
    // Update state
    appState.currentView = viewName;

    // Update UI active link
    navItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-target') === viewName);
    });

    // Inject HTML content
    contentArea.innerHTML = views[viewName];

    // If we have data, populate the new view immediately
    if (appState.data) {
        processAndRenderData(appState.data);
    }
}


// === Clock Feature (Malaysia Time) ===
function startMalaysiaClock() {
    const updateClock = () => {
        const now = new Date();
        const optionsDate = { timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        const optionsTime = { timeZone: 'Asia/Kuala_Lumpur', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
        
        dateDisplay.textContent = new Intl.DateTimeFormat('en-US', optionsDate).format(now);
        timeDisplay.textContent = new Intl.DateTimeFormat('en-US', optionsTime).format(now);
    };
    updateClock(); // Run immediately
    setInterval(updateClock, 1000); // Then every second
}


// === API & Data Handling ===
async function fetchData() {
    try {
        // Note: The 'no-cors' mode is used here because Google Apps Script web apps
        // often have CORS issues when called directly from a browser.
        // However, 'no-cors' results in an opaque response that you cannot read JSON from.
        // IF YOUR API CORRECTLY HANDLES CORS, remove {mode: 'no-cors'}.
        // If it doesn't, you need a proxy or the API script needs to set CORS headers.
        
        // *** CRITICAL ASSUMPTION FOR THIS DEMO CODE ***
        // Because I cannot actually fetch your data due to CORS/security in this environment,
        // I am simulating a successful fetch with placeholder data structure based on your images.
        // You must replace the contents of this fetch success block with actual response handling.

        /* --- REAL IMPLEMENTATION SHOULD LOOK LIKE THIS ---
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        appState.data = data;
        appState.lastUpdated = new Date();
        processAndRenderData(data);
        -------------------------------------------------- */

        // --- SIMULATED DATA FETCH FOR DEMONSTRATION ---
        // Simulating network latency
        await new Promise(r => setTimeout(r, 200)); 
        const simulatedData = generateSimulatedData(); // See helper below
        appState.data = simulatedData;
        processAndRenderData(simulatedData);
        // -------------------------------------------

    } catch (error) {
        console.error('Error fetching data:', error);
        // Optional: update UI to show connection error if it persists
    }
}

// Central function to route data to the active view's update function
function processAndRenderData(data) {
    switch (appState.currentView) {
        case 'pico-system-info':
            updatePicoView(data);
            break;
        case 'eggs-info':
            updateEggsInfoView(data);
            break;
        case 'system-log':
            updateSystemLogView(data);
            break;
        case 'dashboard':
            // Nothing dynamic to update on dashboard currently
            break;
    }
}


// === View Specific Update Functions ===

function updatePicoView(data) {
    // Assuming data structure: data.systemStats = { cpu: '46%', ... }
    const stats = data.systemStats;
    if (!stats) return;

    document.getElementById('pico-cpu').textContent = stats.cpu || '--%';
    document.getElementById('pico-memory').textContent = stats.memory || '--%';
    document.getElementById('pico-temp').textContent = stats.picoTemp || '--°C';
    document.getElementById('pico-time').textContent = stats.time || '--:--:--';
    document.getElementById('pico-location').textContent = stats.location || '--';
}

function updateSystemLogView(data) {
    // Assuming data structure: data.recentLogs = [ {time:..., event:...}, ... ]
    const logs = data.recentLogs;
    const tbody = document.getElementById('log-table-body');
    if (!logs || !tbody) return;

    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No recent logs.</td></tr>';
        return;
    }

    let html = '';
    logs.forEach(log => {
        html += `
            <tr>
                <td>${log.time}</td>
                <td>${log.eggID}</td>
                <td>${log.weight}</td>
                <td>${log.grade}</td>
                <td>${log.event}</td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function updateEggsInfoView(data) {
    // Assuming data structure: data.allEggRecords = [ {timestamp: 'ISO-String', grade: 'A', weight: 55.2}, ... ]
    const allRecords = data.allEggRecords;
    if (!allRecords) return;

    // Helper to check dates relative to REFERENCE_NOW
    const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    const isSameMonth = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
    
    // Calculate start of the week (assuming Sunday start based on images)
    const startOfWeek = new Date(REFERENCE_NOW);
    startOfWeek.setDate(REFERENCE_NOW.getDate() - REFERENCE_NOW.getDay());
    startOfWeek.setHours(0,0,0,0);

    let dailyRecords = [];
    let weeklyRecords = [];
    let monthlyRecords = [];

    // 1. Filter records into time buckets
    allRecords.forEach(record => {
        const recordDate = new Date(record.timestamp);
        
        if (isSameDay(recordDate, REFERENCE_NOW)) {
            dailyRecords.push(record);
        }
        if (recordDate >= startOfWeek && recordDate <= REFERENCE_NOW) {
            weeklyRecords.push(record);
        }
        if (isSameMonth(recordDate, REFERENCE_NOW)) {
            monthlyRecords.push(record);
        }
    });

    // 2. Calculate Daily Top Cards Totals
    calculateAndRenderTopCards(dailyRecords);

    // 3. Calculate and Render Tables
    renderSummaryTable('daily-table-body', aggregateGrades(dailyRecords));
    renderSummaryTable('weekly-table-body', aggregateGrades(weeklyRecords));
    renderSummaryTable('monthly-table-body', aggregateGrades(monthlyRecords));
}

// Helpers for Eggs Info Calculations
function aggregateGrades(records) {
    const counts = { A: 0, B: 0, C: 0, D: 0, Rejected: 0, Total: 0 };
    records.forEach(r => {
        if (counts.hasOwnProperty(r.grade)) {
            counts[r.grade]++;
            counts.Total++;
        }
    });
    return counts;
}

function calculateAndRenderTopCards(dailyRecords) {
    let totalWeight = 0;
    let rejectedCount = 0;
    const grades = { A:0, B:0, C:0, D:0 };

    dailyRecords.forEach(r => {
        totalWeight += (r.weight || 0);
        if (r.grade === 'Rejected') rejectedCount++;
        if (grades.hasOwnProperty(r.grade)) grades[r.grade]++;
    });

    const avgWeight = dailyRecords.length > 0 ? (totalWeight / dailyRecords.length).toFixed(1) : 0;

    document.getElementById('daily-total').textContent = dailyRecords.length;
    document.getElementById('daily-rejected').textContent = rejectedCount;
    document.getElementById('daily-avg-weight').textContent = `${avgWeight} g`;
    
    document.getElementById('daily-grade-a').textContent = grades.A;
    document.getElementById('daily-grade-b').textContent = grades.B;
    document.getElementById('daily-grade-c').textContent = grades.C;
    document.getElementById('daily-grade-d').textContent = grades.D;
}

function renderSummaryTable(tbodyId, counts) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const rows = ['A', 'B', 'C', 'D'].map(grade => {
        // In the designs, "Total Rejected" column seems to only apply if the grade itself is "Rejected". 
        // For standard grades, it's empty based on image 0. Let's replicate that.
        return `
            <tr>
                <td>${grade}</td>
                <td>${counts[grade]}</td>
                <td></td> 
            </tr>
        `;
    }).join('');

    // Add Rejected row specifically
    const rejectedRow = `
        <tr>
            <td>Rejected</td>
            <td>${counts.Rejected}</td>
            <td>${counts.Rejected}</td>
        </tr>
    `;

    tbody.innerHTML = rows + rejectedRow;
}


// =========================================
// HELPER: SIMULATED DATA GENERATOR
// (Remove this function in production and use real API response)
// =========================================
function generateSimulatedData() {
    // Use the fixed reference time for simulation consistency
    const nowStr = REFERENCE_NOW.toLocaleTimeString('en-US', { timeZone: 'Asia/Kuala_Lumpur', hour12: true });

    // Simulate PICO data varying slightly
    const cpu = Math.floor(Math.random() * (55 - 40 + 1) + 40);
    const temp = (Math.random() * (36.5 - 35.0) + 35.0).toFixed(1);

    // Simulate a tiny chance of a new egg event adding to the historical record
    if (Math.random() > 0.7 && window.simulatedEggRecords) {
        const grades = ['A', 'B', 'C', 'D', 'Rejected'];
        const g = grades[Math.floor(Math.random() * grades.length)];
        const w = (Math.random() * (70 - 30) + 30).toFixed(1);
        window.simulatedEggRecords.push({
            timestamp: REFERENCE_NOW.toISOString(),
            grade: g,
            weight: parseFloat(w),
            id: Math.floor(Math.random() * 9000 + 1000)
        });
    }

    return {
        systemStats: {
            cpu: `${cpu}%`,
            memory: "62%",
            picoTemp: `${temp}°C`,
            time: nowStr,
            location: "Sorting Line A"
        },
        // Use a persistent simulated dataset
        allEggRecords: getSimulatedHistoricalData(),
        recentLogs: [
            { "time": nowStr, "eggID": 2205, "weight": "59.2", "grade": "B", "event": "Egg Sorted" },
            { "time": "11:25:10 AM", "eggID": 2121, "weight": "29.8", "grade": "Rejected", "event": "Egg Failed Weight Check" },
            { "time": "11:23:55 AM", "eggID": 2120, "weight": "42.4", "grade": "D", "event": "Egg Sorted" },
            { "time": "11:22:40 AM", "eggID": 2119, "weight": "50.7", "grade": "C", "event": "Egg Sorted" },
            { "time": "11:21:05 AM", "eggID": 2118, "weight": "58.3", "grade": "B", "event": "Egg Sorted" },
        ]
    };
}

function getSimulatedHistoricalData() {
    // Create some dummy historical data once
    if (!window.simulatedEggRecords) {
        window.simulatedEggRecords = [];
        const grades = ['A', 'B', 'C', 'D', 'Rejected'];
        // Generate data for the "current" month up to the reference date
        for (let i = 1; i <= REFERENCE_NOW.getDate(); i++) {
            // More eggs on later days
            const dailyCount = Math.floor(Math.random() * 20) + 10; 
            for (let j = 0; j < dailyCount; j++) {
                const grade = grades[Math.floor(Math.random() * grades.length)];
                const weight = (Math.random() * (70 - 30) + 30).toFixed(1);
                const date = new Date(REFERENCE_NOW.getFullYear(), REFERENCE_NOW.getMonth(), i, Math.floor(Math.random()*12)+8, Math.floor(Math.random()*59));
                window.simulatedEggRecords.push({
                    timestamp: date.toISOString(),
                    grade: grade,
                    weight: parseFloat(weight),
                    id: Math.floor(Math.random() * 9000 + 1000)
                });
            }
        }
    }
    return window.simulatedEggRecords;
}

// Start the app

document.addEventListener('DOMContentLoaded', init);

