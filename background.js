// Background service worker that keeps the system awake

let isEnabled = false;
let batteryInfo = null;

// Initialize on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["enabled"], (result) => {
    isEnabled = result.enabled || false;
    if (isEnabled) {
      enableNoSleep();
    }
  });
});

// Load state when service worker starts
chrome.storage.local.get(["enabled"], (result) => {
  isEnabled = result.enabled || false;
  if (isEnabled) {
    enableNoSleep();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle") {
    isEnabled = request.enabled;
    chrome.storage.local.set({ enabled: isEnabled });

    if (isEnabled) {
      enableNoSleep();
      showNotification("No Sleep Enabled", "Your computer will stay awake");
    } else {
      disableNoSleep();
      showNotification("No Sleep Disabled", "Your computer can sleep normally");
    }

    sendResponse({ success: true, enabled: isEnabled });
  } else if (request.action === "getStatus") {
    sendResponse({ enabled: isEnabled, battery: batteryInfo });
  }
  return true;
});

// Enable no-sleep mode
function enableNoSleep() {
  // Request system to stay awake (prevents display and system from sleeping)
  chrome.power.requestKeepAwake("system");
  console.log("No Sleep mode enabled");

  // Start monitoring battery
  monitorBattery();
}

// Disable no-sleep mode
function disableNoSleep() {
  // Release keep awake request
  chrome.power.releaseKeepAwake();
  console.log("No Sleep mode disabled");
}

// Monitor battery status using Battery API
async function monitorBattery() {
  if (!navigator.getBattery) {
    console.log("Battery API not supported");
    return;
  }

  try {
    const battery = await navigator.getBattery();

    function updateBatteryInfo() {
      batteryInfo = {
        level: Math.round(battery.level * 100),
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
      };

      console.log("Battery:", batteryInfo);

      // Show notification if battery is low and not charging
      if (isEnabled && batteryInfo.level < 20 && !batteryInfo.charging) {
        showNotification(
          "Low Battery Warning",
          `Battery is at ${batteryInfo.level}%. Consider charging your device.`
        );
      }

      // Show notification if battery is charging and above 95%
      if (isEnabled && batteryInfo.level > 95 && batteryInfo.charging) {
        showNotification(
          "Battery Almost Full",
          `Battery is at ${batteryInfo.level}%. Consider unplugging to preserve battery health.`
        );
      }
    }

    // Initial update
    updateBatteryInfo();

    // Listen for battery changes
    battery.addEventListener("levelchange", updateBatteryInfo);
    battery.addEventListener("chargingchange", updateBatteryInfo);
  } catch (error) {
    console.error("Error accessing battery:", error);
  }
}

// Show notification with sound
async function showNotification(title, message) {
  // Play notification sound
  await playNotificationSound();

  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: title,
    message: message,
    priority: 2,
  });
}

// Create offscreen document for audio playback
let creatingOffscreen = null;

async function setupOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
  });

  if (existingContexts.length > 0) {
    return; // Already exists
  }

  if (creatingOffscreen) {
    await creatingOffscreen;
  } else {
    creatingOffscreen = chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Playing notification sound",
    });
    await creatingOffscreen;
    creatingOffscreen = null;
  }
}

// Play notification sound via offscreen document
async function playNotificationSound() {
  try {
    await setupOffscreenDocument();
    await chrome.runtime.sendMessage({ action: "playSound" });
  } catch (error) {
    console.log("Could not play sound:", error);
  }
}

// Keep service worker alive by periodic tasks
chrome.alarms.create("keepAlive", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "keepAlive" && isEnabled) {
    console.log("Keep alive ping");
  }
});
