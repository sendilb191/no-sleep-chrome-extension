// Popup UI controller

const toggleBtn = document.getElementById("toggleBtn");
const statusText = document.getElementById("statusText");
const batteryInfo = document.getElementById("batteryInfo");

// Load current status
chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
  updateUI(response.enabled, response.battery);
});

// Toggle button click handler
toggleBtn.addEventListener("click", () => {
  const currentEnabled = toggleBtn.classList.contains("enabled");
  const newEnabled = !currentEnabled;

  chrome.runtime.sendMessage(
    { action: "toggle", enabled: newEnabled },
    (response) => {
      if (response.success) {
        updateUI(response.enabled);
      }
    }
  );
});

// Update UI based on status
function updateUI(enabled, battery) {
  if (enabled) {
    statusText.textContent = "🟢 Active - Computer Won't Sleep";
    toggleBtn.textContent = "Disable";
    toggleBtn.className = "toggle-btn enabled";
  } else {
    statusText.textContent = "🔴 Inactive - Normal Sleep Mode";
    toggleBtn.textContent = "Enable";
    toggleBtn.className = "toggle-btn disabled";
  }

  // Display battery information if available
  if (battery) {
    const chargingStatus = battery.charging ? "🔌 Charging" : "🔋 On Battery";
    batteryInfo.textContent = `${chargingStatus} - ${battery.level}%`;
  } else {
    batteryInfo.textContent = "Battery info not available";
  }
}
