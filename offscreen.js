// Offscreen document for playing audio and monitoring battery

let lastBatteryLevel = null;
let lastChargingState = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "playSound") {
    playNotificationSound();
    sendResponse({ success: true });
  } else if (request.action === "startBatteryMonitoring") {
    startBatteryMonitoring();
    sendResponse({ success: true });
  } else if (request.action === "getBattery") {
    sendResponse({ level: lastBatteryLevel, charging: lastChargingState });
  }
  return true;
});

function playNotificationSound() {
  const audio = document.getElementById("notificationSound");
  let playCount = 0;
  const maxPlays = 2;
  const interval = 2000; // 2 seconds

  function playOnce() {
    audio.currentTime = 0;
    audio.play().catch((error) => {
      console.error("Error playing sound:", error);
    });
    playCount++;

    if (playCount < maxPlays) {
      setTimeout(playOnce, interval);
    }
  }

  playOnce();
}

// Monitor battery and send alerts to background script
async function startBatteryMonitoring() {
  if (!navigator.getBattery) {
    console.log("Battery API not supported");
    return;
  }

  try {
    const battery = await navigator.getBattery();

    function checkBattery() {
      const level = Math.round(battery.level * 100);
      const charging = battery.charging;

      lastBatteryLevel = level;
      lastChargingState = charging;

      // Send battery update to background script for notification logic
      chrome.runtime.sendMessage({
        action: "batteryUpdate",
        level: level,
        charging: charging,
      });
    }

    // Initial check
    checkBattery();

    // Listen for changes
    battery.addEventListener("levelchange", checkBattery);
    battery.addEventListener("chargingchange", checkBattery);

    console.log("Battery monitoring started");
  } catch (error) {
    console.error("Battery monitoring error:", error);
  }
}

// Auto-start battery monitoring when offscreen document loads
startBatteryMonitoring();
