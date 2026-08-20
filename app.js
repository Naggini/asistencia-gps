// =========================
// CONFIGURATION
// =========================

const OFFICE_LATITUDE = 12.113001844657637;
const OFFICE_LONGITUDE = -86.26464538650465;

const ALLOWED_RADIUS_METERS = 100;
const MAX_GPS_ACCURACY_METERS = 50;


// =========================
// ELEMENTS
// =========================

const employeeIdInput = document.getElementById("employeeId");
const currentDateElement = document.getElementById("currentDate");
const currentTimeElement = document.getElementById("currentTime");

const verifyLocationBtn = document.getElementById("verifyLocationBtn");
const checkInBtn = document.getElementById("checkInBtn");

const locationStatus = document.getElementById("locationStatus");
const statusText = document.getElementById("statusText");

const distanceValue = document.getElementById("distanceValue");
const accuracyValue = document.getElementById("accuracyValue");

const messageBox = document.getElementById("messageBox");


// =========================
// DATE & TIME
// =========================

function updateDateTime() {
    const now = new Date();

    currentDateElement.textContent = now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });

    currentTimeElement.textContent = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

updateDateTime();
setInterval(updateDateTime, 1000);


// =========================
// MESSAGE
// =========================

function showMessage(message, type = "info") {
    messageBox.textContent = message;
    messageBox.className = `message show ${type}`;
}


// =========================
// LOCATION STATUS
// =========================

function updateLocationStatus(text, status) {
    statusText.textContent = text;

    locationStatus.className = `location-status ${status}`;

    const dot = locationStatus.querySelector(".status-dot");

    if (status === "verified") {
        dot.style.background = "#16a34a";
    } else if (status === "error") {
        dot.style.background = "#dc2626";
    } else if (status === "checking") {
        dot.style.background = "#f59e0b";
    } else {
        dot.style.background = "#9ca3af";
    }
}


// =========================
// DISTANCE CALCULATION
// HAVERSINE FORMULA
// =========================

function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371000;

    const latitudeDifference = degreesToRadians(lat2 - lat1);
    const longitudeDifference = degreesToRadians(lon2 - lon1);

    const a =
        Math.sin(latitudeDifference / 2) *
        Math.sin(latitudeDifference / 2) +
        Math.cos(degreesToRadians(lat1)) *
        Math.cos(degreesToRadians(lat2)) *
        Math.sin(longitudeDifference / 2) *
        Math.sin(longitudeDifference / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
}

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}


// =========================
// VERIFY LOCATION
// =========================

function verifyLocation() {

    if (!navigator.geolocation) {
        updateLocationStatus("Geolocation not supported", "error");

        showMessage(
            "Your browser does not support location services.",
            "error"
        );

        return;
    }

    verifyLocationBtn.disabled = true;
    verifyLocationBtn.innerHTML = "⏳ VERIFYING LOCATION...";

    updateLocationStatus("Checking your location...", "checking");

    showMessage(
        "Please wait while we securely verify your current location.",
        "info"
    );

    navigator.geolocation.getCurrentPosition(
        locationSuccess,
        locationError,
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}


// =========================
// LOCATION SUCCESS
// =========================

function locationSuccess(position) {

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    const distance = calculateDistance(
        latitude,
        longitude,
        OFFICE_LATITUDE,
        OFFICE_LONGITUDE
    );

    distanceValue.textContent = `${Math.round(distance)} meters`;
    accuracyValue.textContent = `± ${Math.round(accuracy)} meters`;

    verifyLocationBtn.disabled = false;
    verifyLocationBtn.innerHTML = "📍 VERIFY MY LOCATION";

    // Check GPS accuracy first
    if (accuracy > MAX_GPS_ACCURACY_METERS) {

        updateLocationStatus(
            "Location accuracy is too low",
            "error"
        );

        showMessage(
            `Your GPS accuracy is ±${Math.round(accuracy)} meters. ` +
            `Please move to an area with better signal and try again.`,
            "error"
        );

        checkInBtn.disabled = true;
        checkInBtn.innerHTML = "🔒 CHECK IN";

        return;
    }

    // Check office radius
    if (distance <= ALLOWED_RADIUS_METERS) {

        updateLocationStatus(
            "Location verified — You are within the office area",
            "verified"
        );

        showMessage(
            `Location verified successfully. You are approximately ` +
            `${Math.round(distance)} meters from the office.`,
            "success"
        );

        checkInBtn.disabled = false;
        checkInBtn.innerHTML = "✓ CHECK IN";

    } else {

        updateLocationStatus(
            "You are outside the allowed office area",
            "error"
        );

        showMessage(
            `You are approximately ${Math.round(distance)} meters from ` +
            `the office. You must be within ${ALLOWED_RADIUS_METERS} meters ` +
            `to check in.`,
            "error"
        );

        checkInBtn.disabled = true;
        checkInBtn.innerHTML = "🔒 CHECK IN";
    }
}


// =========================
// LOCATION ERROR
// =========================

function locationError(error) {

    verifyLocationBtn.disabled = false;
    verifyLocationBtn.innerHTML = "📍 VERIFY MY LOCATION";

    checkInBtn.disabled = true;
    checkInBtn.innerHTML = "🔒 CHECK IN";

    let message = "Unable to verify your location.";

    switch (error.code) {

        case error.PERMISSION_DENIED:
            message =
                "Location permission was denied. Please allow location " +
                "access in your browser settings and try again.";
            break;

        case error.POSITION_UNAVAILABLE:
            message =
                "Your location is currently unavailable. Please check your " +
                "GPS connection and try again.";
            break;

        case error.TIMEOUT:
            message =
                "Location verification timed out. Please try again.";
            break;
    }

    updateLocationStatus("Location verification failed", "error");

    showMessage(message, "error");
}


// =========================
// CHECK IN
// =========================

function checkIn() {

    const employeeId = employeeIdInput.value.trim();

    if (!employeeId) {

        showMessage(
            "Please enter your Employee ID before checking in.",
            "error"
        );

        employeeIdInput.focus();
        return;
    }

    const now = new Date();

    updateLocationStatus(
        "Checked in successfully",
        "verified"
    );

    showMessage(
        `Check-in successful for Employee ID: ${employeeId} at ` +
        `${now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        })}.`,
        "success"
    );

    checkInBtn.disabled = true;
    checkInBtn.innerHTML = "✓ CHECKED IN";
}


// =========================
// EVENTS
// =========================

verifyLocationBtn.addEventListener("click", verifyLocation);
checkInBtn.addEventListener("click", checkIn);
