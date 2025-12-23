// Background service worker that keeps the system awake

let isEnabled = false;
let batteryInfo = null;

// Initialize on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["enabled"], (result) => {
    isEnabled = result.enabled || false;
    updateIconBadge();
    if (isEnabled) {
      enableNoSleep();
    }
  });
});

// Load state when service worker starts
chrome.storage.local.get(["enabled"], (result) => {
  isEnabled = result.enabled || false;
  updateIconBadge();
  if (isEnabled) {
    enableNoSleep();
  }
});

// Listen for messages from popup and offscreen document
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
  } else if (request.action === "batteryUpdate") {
    // Handle battery updates from offscreen document
    handleBatteryUpdate(request.level, request.charging);
    sendResponse({ success: true });
  } else if (request.action === "testNotification") {
    // Test notification with sound
    showNotification(
      "Test Notification",
      "Sound and notification are working! 🔔"
    );
    sendResponse({ success: true });
  }
  return true;
});

// Track if we've already shown notifications to avoid spam
let lowBatteryNotified = false;
let fullBatteryNotified = false;

// Handle battery updates from offscreen document
function handleBatteryUpdate(level, charging) {
  batteryInfo = { level, charging };
  console.log("Battery update:", batteryInfo);

  if (!isEnabled) return;

  // Low battery warning (< 20% and not charging)
  if (level < 20 && !charging) {
    if (!lowBatteryNotified) {
      showNotification(
        "Low Battery Warning",
        `Battery is at ${level}%. Consider charging your device.`
      );
      lowBatteryNotified = true;
    }
  } else {
    lowBatteryNotified = false; // Reset when condition changes
  }

  // Full battery alert (> 95% and charging)
  if (level > 95 && charging) {
    if (!fullBatteryNotified) {
      showNotification(
        "Battery Almost Full",
        `Battery is at ${level}%. Consider unplugging to preserve battery health.`
      );
      fullBatteryNotified = true;
    }
  } else {
    fullBatteryNotified = false; // Reset when condition changes
  }
}

// Update toolbar icon badge to show active/inactive state
function updateIconBadge() {
  if (isEnabled) {
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeBackgroundColor({ color: "#10b981" }); // Green
  } else {
    chrome.action.setBadgeText({ text: "" }); // No badge when off
    chrome.action.setBadgeBackgroundColor({ color: "#ef4444" }); // Red
  }
}

// Enable no-sleep mode
async function enableNoSleep() {
  // Request system to stay awake (prevents display and system from sleeping)
  chrome.power.requestKeepAwake("system");
  console.log("No Sleep mode enabled");
  updateIconBadge();

  // Start battery monitoring via offscreen document
  await setupOffscreenDocument();
}

// Disable no-sleep mode
function disableNoSleep() {
  // Release keep awake request
  chrome.power.releaseKeepAwake();
  console.log("No Sleep mode disabled");
  updateIconBadge();
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
