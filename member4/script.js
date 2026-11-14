
// ECODRAIN - Member 4
// Environmental Health Monitoring


// ------------------------------------
// 1. LOAD SAVED HEALTH RECORDS
// ------------------------------------

let healthRecords = [];

try {
    healthRecords = JSON.parse(
        localStorage.getItem("ecodrainHealthRecords") || "[]"
    );

    if (!Array.isArray(healthRecords)) {
        healthRecords = [];
    }

} catch (error) {
    console.error("Error loading health records:", error);
    healthRecords = [];
}


// ------------------------------------
// 2. CLASSIFY ENVIRONMENTAL CONDITION
// ------------------------------------

function classifyCondition(water, drainage, waste, observations) {

    const notes = String(observations || "").toLowerCase();

    // Critical conditions
    if (
        drainage === "Complete Blockage" ||
        water === "Highly Polluted" ||
        waste === "High" ||
        notes.includes("overflow") ||
        notes.includes("waterlogging") ||
        notes.includes("flooding")
    ) {
        return "Critical";
    }

    // Conditions needing monitoring
    if (
        drainage === "Partial Blockage" ||
        water === "Dirty" ||
        waste === "Moderate"
    ) {
        return "Needs Monitoring";
    }

    return "Normal";
}


// ------------------------------------
// 3. GENERATE ENVIRONMENTAL ALERTS
// ------------------------------------

function generateAlert(record) {

    if (record.status === "Critical") {
        return "Critical environmental condition reported at " +
            record.location;
    }

    if (record.status === "Needs Monitoring") {
        return "Environmental monitoring required at " +
            record.location;
    }

    return "";
}


// ------------------------------------
// 4. SAVE RECORDS IN LOCAL STORAGE
// ------------------------------------

function saveRecords() {

    try {
        localStorage.setItem(
            "ecodrainHealthRecords",
            JSON.stringify(healthRecords)
        );

    } catch (error) {
        console.error("Error saving health records:", error);
        alert("Unable to save records in this browser.");
    }
}


// ------------------------------------
// 5. UPDATE MAIN DASHBOARD COUNTS
// ------------------------------------

function updateDashboard() {

    const totalLogs = document.getElementById("totalLogs");
    const normalCount = document.getElementById("normalCount");
    const monitorCount = document.getElementById("monitorCount");
    const criticalCount = document.getElementById("criticalCount");

    if (totalLogs) {
        totalLogs.textContent = healthRecords.length;
    }

    if (normalCount) {
        normalCount.textContent = healthRecords.filter(
            record => record.status === "Normal"
        ).length;
    }

    if (monitorCount) {
        monitorCount.textContent = healthRecords.filter(
            record => record.status === "Needs Monitoring"
        ).length;
    }

    if (criticalCount) {
        criticalCount.textContent = healthRecords.filter(
            record => record.status === "Critical"
        ).length;
    }
}


// ------------------------------------
// 6. DISPLAY HISTORICAL HEALTH RECORDS
// ------------------------------------

function displayRecords() {

    const recordsDiv = document.getElementById("records");

    if (!recordsDiv) {
        return;
    }

    const searchInput = document.getElementById("searchLocation");
    const statusFilter = document.getElementById("filterStatus");

    const searchText = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const selectedStatus = statusFilter
        ? statusFilter.value
        : "All";

    // Filter records by location and condition
    const filteredRecords = healthRecords.filter(record => {

        const location = String(record.location || "").toLowerCase();

        const matchesLocation = location.includes(searchText);

        const matchesStatus =
            selectedStatus === "All" ||
            record.status === selectedStatus;

        return matchesLocation && matchesStatus;
    });

    if (filteredRecords.length === 0) {
        recordsDiv.textContent = "No matching health records found.";
        return;
    }

    recordsDiv.innerHTML = "";

    // Display newest records first
    [...filteredRecords].reverse().forEach(record => {

        const card = document.createElement("div");
        card.className = "record-card";

        const heading = document.createElement("h3");
        heading.textContent = record.location || "Unknown Location";

        const status = document.createElement("p");
        status.textContent = "Condition: " + record.status;

        status.className =
            "status " +
            String(record.status || "").toLowerCase().replaceAll(" ", "-");

        const details = document.createElement("p");

        details.textContent =
            "Water: " + (record.water || "Not recorded") +
            " | Drainage: " + (record.drainage || "Not recorded") +
            " | Waste: " + (record.waste || "Not recorded");

        const observations = document.createElement("p");

        observations.textContent =
            "Observations: " + (record.observations || "None");

        const date = document.createElement("small");

        date.textContent =
            "Recorded: " + (record.date || "Date unavailable");

        card.append(heading, status, details, observations, date);

        if (record.alert) {

            const alertMessage = document.createElement("p");

            alertMessage.className = "alert-message";
            alertMessage.textContent = "⚠ " + record.alert;

            card.appendChild(alertMessage);
        }

        recordsDiv.appendChild(card);
    });
}


// ------------------------------------
// 7. DISPLAY ENVIRONMENTAL ALERTS
// ------------------------------------

function displayAlerts() {

    const alertsDiv = document.getElementById("alertsList");

    if (!alertsDiv) {
        return;
    }

    const alerts = healthRecords.filter(
        record => record.alert
    );

    if (alerts.length === 0) {
        alertsDiv.textContent = "No alerts available.";
        return;
    }

    alertsDiv.innerHTML = "";

    // Display newest alerts first
    [...alerts].reverse().forEach(record => {

        const alertCard = document.createElement("div");
        alertCard.className = "alert-card";

        const heading = document.createElement("h3");
        heading.textContent = "⚠ " + record.location;

        const message = document.createElement("p");
        message.textContent = record.alert;

        const severity = document.createElement("p");
        severity.textContent = "Severity: " + record.status;

        const date = document.createElement("small");

        date.textContent =
            "Reported: " + (record.date || "Date unavailable");

        const status = document.createElement("p");

        if (record.resolved) {

            status.textContent = "Status: Resolved";
            status.className = "resolved-status";

        } else {

            status.textContent = "Status: Active";
            status.className = "active-status";
        }

        alertCard.append(heading, message, severity, date, status);

        // Mark alert as resolved
        if (!record.resolved) {

            const button = document.createElement("button");

            button.textContent = "Mark as Resolved";
            button.className = "resolve-button";

            button.addEventListener("click", function () {

                const selectedRecord = healthRecords.find(
                    item => item.id === record.id
                );

                if (selectedRecord) {

                    selectedRecord.resolved = true;

                    selectedRecord.resolvedAt =
                        new Date().toLocaleString();

                    saveRecords();
                    displayAlerts();
                }
            });

            alertCard.appendChild(button);

        } else {

            const resolvedDate = document.createElement("small");

            resolvedDate.textContent =
                "Resolved on: " +
                (record.resolvedAt || "Date unavailable");

            alertCard.appendChild(resolvedDate);
        }

        alertsDiv.appendChild(alertCard);
    });
}


// ------------------------------------
// 8. HANDLE HEALTH LOG FORM SUBMISSION
// ------------------------------------

function setupHealthForm() {

    const healthForm = document.getElementById("healthForm");

    if (!healthForm) {
        console.error("Health form not found in index.html");
        return;
    }

    healthForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const location = document
            .getElementById("location").value.trim();

        const water = document
            .getElementById("water").value;

        const drainage = document
            .getElementById("drainage").value;

        const waste = document
            .getElementById("waste").value;

        const observations = document
            .getElementById("problem").value.trim();

        if (!location) {
            alert("Please enter a location.");
            return;
        }

        // Classify environmental condition
        const status = classifyCondition(
            water,
            drainage,
            waste,
            observations
        );

        // Create health record
        const record = {
            id: Date.now(),
            location: location,
            water: water,
            drainage: drainage,
            waste: waste,
            observations: observations,
            status: status,
            date: new Date().toLocaleString(),
            alert: "",
            resolved: false,
            resolvedAt: ""
        };

        // Generate environmental alert
        record.alert = generateAlert(record);

        // Store new record
        healthRecords.push(record);

        // Save and refresh all sections
        saveRecords();
        updateDashboard();
        displayRecords();
        displayAlerts();
        updateAnalytics();

        alert(
            "Health log saved successfully!\n" +
            "Location: " + location +
            "\nClassification: " + status
        );

        healthForm.reset();
    });
}


// ------------------------------------
// 9. SET UP HISTORY SEARCH AND FILTERS
// ------------------------------------

function setupHistoryFilters() {

    const searchInput = document.getElementById("searchLocation");
    const statusFilter = document.getElementById("filterStatus");

    if (searchInput) {
        searchInput.addEventListener("input", displayRecords);
    }

    if (statusFilter) {
        statusFilter.addEventListener("change", displayRecords);
    }
}


// ------------------------------------
// 10. ENVIRONMENTAL ANALYTICS
// ------------------------------------

function updateAnalytics() {

    // CONDITION SUMMARY

    const normal = healthRecords.filter(
        record => record.status === "Normal"
    ).length;

    const monitoring = healthRecords.filter(
        record => record.status === "Needs Monitoring"
    ).length;

    const critical = healthRecords.filter(
        record => record.status === "Critical"
    ).length;

    document.getElementById("analyticsNormal").textContent = normal;

    document.getElementById("analyticsMonitor").textContent = monitoring;

    document.getElementById("analyticsCritical").textContent = critical;


    // FREQUENTLY REPORTED LOCATIONS

    const locationDiv = document.getElementById("locationAnalytics");

    const locationCounts = {};

    healthRecords.forEach(record => {

        const location = String(record.location || "Unknown").trim();

        const key = location.toLowerCase();

        if (!locationCounts[key]) {

            locationCounts[key] = {
                name: location,
                count: 0
            };
        }

        locationCounts[key].count++;
    });

    const frequentLocations = Object.values(locationCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    locationDiv.innerHTML = "";

    if (frequentLocations.length === 0) {

        locationDiv.textContent = "No location data available.";

    } else {

        frequentLocations.forEach(item => {

            const row = document.createElement("p");

            row.textContent =
                item.name + " — " + item.count + " report(s)";

            locationDiv.appendChild(row);
        });
    }


    // RECURRING ENVIRONMENTAL ISSUES

    const issueDiv = document.getElementById("issueAnalytics");

    const issueCounts = {
        "Drainage Blockage": 0,
        "Water Overflow": 0,
        "Waterlogging / Flooding": 0,
        "High Waste Accumulation": 0,
        "Polluted Water": 0
    };

    healthRecords.forEach(record => {

        const notes = String(record.observations || "").toLowerCase();

        if (
            record.drainage === "Partial Blockage" ||
            record.drainage === "Complete Blockage"
        ) {
            issueCounts["Drainage Blockage"]++;
        }

        if (notes.includes("overflow")) {
            issueCounts["Water Overflow"]++;
        }

        if (
            notes.includes("waterlogging") ||
            notes.includes("flooding")
        ) {
            issueCounts["Waterlogging / Flooding"]++;
        }

        if (record.waste === "High") {
            issueCounts["High Waste Accumulation"]++;
        }

        if (record.water === "Highly Polluted") {
            issueCounts["Polluted Water"]++;
        }
    });

    issueDiv.innerHTML = "";

    const reportedIssues = Object.entries(issueCounts)
        .filter(([issue, count]) => count > 0);

    if (reportedIssues.length === 0) {

        issueDiv.textContent =
            "No recurring environmental issues found.";

    } else {

        reportedIssues.forEach(([issue, count]) => {

            const row = document.createElement("p");

            row.textContent =
                issue + " — " + count + " report(s)";

            issueDiv.appendChild(row);
        });
    }


    // ENVIRONMENTAL CONDITION CHART

    const chartDiv = document.getElementById("conditionChart");

    chartDiv.innerHTML = "";

    const total = healthRecords.length;

    if (total === 0) {

        chartDiv.textContent = "No analytics available.";

        return;
    }

    const chartData = [
        { name: "Normal", count: normal },
        { name: "Needs Monitoring", count: monitoring },
        { name: "Critical", count: critical }
    ];

    chartData.forEach(item => {

        const percentage = (item.count / total) * 100;

        const row = document.createElement("div");
        row.className = "chart-row";

        const label = document.createElement("p");

        label.textContent =
            item.name + ": " + item.count +
            " (" + percentage.toFixed(1) + "%)";

        const barBackground = document.createElement("div");
        barBackground.className = "chart-background";

        const bar = document.createElement("div");
        bar.className = "chart-bar";

        bar.style.width = percentage + "%";

        barBackground.appendChild(bar);

        row.append(label, barBackground);

        chartDiv.appendChild(row);
    });
}


// ------------------------------------
// 11. INITIALIZE APPLICATION
// ------------------------------------

function initializeApp() {

    // Ensure older records have alert fields
    healthRecords.forEach(record => {

        if (typeof record.resolved !== "boolean") {
            record.resolved = false;
        }

        if (typeof record.resolvedAt !== "string") {
            record.resolvedAt = "";
        }

        if (!record.alert) {
            record.alert = generateAlert(record);
        }
    });

    saveRecords();

    setupHealthForm();
    setupHistoryFilters();

    updateDashboard();
    displayRecords();
    displayAlerts();
    updateAnalytics();

    console.log(
        "ECODRAIN Environmental Health Monitoring loaded successfully!"
    );
}


// Run application after HTML is ready

if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", initializeApp);

} else {

    initializeApp();
}
