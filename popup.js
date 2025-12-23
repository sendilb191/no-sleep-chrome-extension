// Popup UI controller

const toggleBtn = document.getElementById("toggleBtn");
const statusText = document.getElementById("statusText");
const batteryInfo = document.getElementById("batteryInfo");
const testBtn = document.getElementById("testBtn");

// Load current status
chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
  updateUI(response.enabled);
});

// Test notification button click handler
testBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "testNotification" });
});

// Get battery info directly in popup (Battery API works in window context)
async function getBatteryInfo() {
  if (!navigator.getBattery) {
    batteryInfo.textContent = "Battery API not supported";
    return;
  }

  try {
    const battery = await navigator.getBattery();

    function updateBatteryDisplay() {
      const level = Math.round(battery.level * 100);
      const chargingStatus = battery.charging ? "🔌 Charging" : "🔋 On Battery";
      batteryInfo.textContent = `${chargingStatus} - ${level}%`;
    }

    // Initial update
    updateBatteryDisplay();

    // Listen for changes
    battery.addEventListener("levelchange", updateBatteryDisplay);
    battery.addEventListener("chargingchange", updateBatteryDisplay);
  } catch (error) {
    batteryInfo.textContent = "Battery info unavailable";
    console.error("Battery error:", error);
  }
}

// Initialize battery display
getBatteryInfo();

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
function updateUI(enabled) {
  if (enabled) {
    statusText.textContent = "🟢 Active - Computer Won't Sleep";
    toggleBtn.textContent = "Disable";
    toggleBtn.className = "toggle-btn enabled";
  } else {
    statusText.textContent = "🔴 Inactive - Normal Sleep Mode";
    toggleBtn.textContent = "Enable";
    toggleBtn.className = "toggle-btn disabled";
  }
}

// Check and display API support status
function checkApiSupport() {
  const apiStatusList = document.getElementById("apiStatusList");

  const apis = [
    { name: "Power API", supported: typeof chrome?.power !== "undefined" },
    {
      name: "Notifications",
      supported: typeof chrome?.notifications !== "undefined",
    },
    { name: "Storage", supported: typeof chrome?.storage !== "undefined" },
    { name: "Offscreen", supported: typeof chrome?.offscreen !== "undefined" },
    { name: "Alarms", supported: typeof chrome?.alarms !== "undefined" },
    {
      name: "Battery API",
      supported: typeof navigator?.getBattery === "function",
    },
  ];

  apiStatusList.innerHTML = apis
    .map(
      (api) => `
    <div class="api-item">
      <span class="api-name">${api.name}</span>
      <span class="api-badge ${api.supported ? "supported" : "unsupported"}">
        ${api.supported ? "✓ OK" : "✗ Fail"}
      </span>
    </div>
  `
    )
    .join("");
}

// Initialize API status check
checkApiSupport();
