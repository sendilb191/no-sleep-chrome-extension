# ⚡ No Sleep Browser Extension

A browser extension that prevents your computer from sleeping by keeping the browser active in the background. Works with Chrome, Edge, and other Chromium-based browsers. Includes sound notifications for battery alerts.

## What This App Does

This extension solves a common problem: **your computer going to sleep when you need it to stay awake**. Whether you're:

- Downloading large files
- Running long processes
- Presenting content
- Monitoring dashboards
- Or just want your screen to stay on

Simply enable the extension and your computer won't sleep until you disable it. You'll also get audio alerts when your battery is low or fully charged.

## Features

✅ **Runs in background continuously** - Works even when popup is closed  
✅ **Toolbar badge indicator** - Shows "ON" badge when active  
✅ **Battery monitoring** - Real-time battery level and charging status  
✅ **Sound notifications** - Audio plays 2x with 2-second intervals  
✅ **Low battery warning** - Alerts at < 20% when not charging  
✅ **Full battery alert** - Alerts at > 95% when charging  
✅ **Test button** - Verify notifications and sound are working  
✅ **Works across all apps** - System-wide sleep prevention  
✅ **Persists preference** - Remembers your setting after browser restart

## How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │   Popup     │───▶│  Background │───▶│   Offscreen     │ │
│  │  (popup.js) │    │  (Service   │    │   Document      │ │
│  │             │◀───│   Worker)   │◀───│                 │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
│        │                   │                    │           │
│        ▼                   ▼                    ▼           │
│   User clicks         Power API           Battery API      │
│   toggle button      (keep awake)        (monitoring)      │
│                           │                    │           │
│                           ▼                    ▼           │
│                    Notifications         Audio Playback    │
└─────────────────────────────────────────────────────────────┘
```

### Step-by-Step Flow

1. **User clicks Enable** → `popup.js` sends message to `background.js`
2. **Background activates** → Calls `chrome.power.requestKeepAwake('system')`
3. **Offscreen document created** → Starts battery monitoring
4. **Battery changes detected** → Offscreen sends update to background
5. **Threshold reached** → Background triggers notification + sound
6. **Sound plays** → Offscreen document plays audio 2x with 2s interval

## Project Structure

```
no-sleep-chrome-extension/
├── manifest.json         # Extension configuration & permissions
├── background.js         # Service worker - core logic
├── popup.html            # Extension popup UI
├── popup.js              # Popup controller & battery display
├── offscreen.html        # Hidden document for audio/battery
├── offscreen.js          # Audio player & battery monitor
├── sounds/
│   └── notification.wav  # Alert sound file
├── icons/
│   ├── icon.svg          # Source vector icon
│   ├── icon16.png        # Toolbar icon
│   ├── icon32.png        # Medium icon
│   ├── icon48.png        # Extension page icon
│   └── icon128.png       # Store/install icon
└── README.md             # This documentation
```

## Detailed File Descriptions

### `manifest.json`

**Purpose**: Extension configuration file required by all browser extensions.

**What it defines**:

- `manifest_version: 3` - Uses latest extension standard
- `permissions` - APIs the extension can access:
  - `power` - Keep system awake
  - `notifications` - Show desktop alerts
  - `storage` - Save user preferences
  - `offscreen` - Create hidden documents
  - `alarms` - Schedule periodic tasks
- `background.service_worker` - Registers background script
- `action` - Popup UI and toolbar icons

---

### `background.js`

**Purpose**: The brain of the extension. Runs continuously as a service worker.

**Key Functions**:
| Function | What It Does |
|----------|--------------|
| `enableNoSleep()` | Calls Power API to prevent sleep, creates offscreen document |
| `disableNoSleep()` | Releases keep-awake request |
| `handleBatteryUpdate()` | Processes battery info, triggers notifications if thresholds met |
| `showNotification()` | Displays notification and plays sound |
| `setupOffscreenDocument()` | Creates hidden document for audio/battery |
| `playNotificationSound()` | Sends play command to offscreen document |
| `updateIconBadge()` | Shows/hides "ON" badge on toolbar icon |

**Message Handlers**:

- `toggle` - Enable/disable from popup
- `getStatus` - Return current state to popup
- `batteryUpdate` - Receive battery info from offscreen
- `testNotification` - Trigger test alert

---

### `popup.html`

**Purpose**: The UI that appears when you click the extension icon.

**Elements**:

- Title with lightning bolt icon
- Status box showing active/inactive state
- Battery level and charging status
- Enable/Disable toggle button (green/red)
- Test Notification button
- Info text explaining the extension

**Styling**: Purple gradient background, modern rounded cards, smooth button animations.

---

### `popup.js`

**Purpose**: Controls the popup UI and handles user interactions.

**What it does**:

1. Loads current enabled state from background
2. Fetches battery info directly (Battery API works in popup context)
3. Handles toggle button clicks
4. Handles test notification button
5. Updates UI to reflect current state

---

### `offscreen.html`

**Purpose**: A hidden HTML document that runs in a window context (not a service worker).

**Why it exists**: Service workers in Manifest V3 cannot:

- Play audio (no Audio API)
- Access Battery API

This document provides those capabilities.

**Contents**: Just an audio element and script reference.

---

### `offscreen.js`

**Purpose**: Handles audio playback and battery monitoring.

**Key Functions**:
| Function | What It Does |
|----------|--------------|
| `playNotificationSound()` | Plays sound 2 times with 2-second interval |
| `startBatteryMonitoring()` | Watches battery level/charging via Battery API |
| `checkBattery()` | Sends battery updates to background script |

**Message Handlers**:

- `playSound` - Trigger audio playback
- `startBatteryMonitoring` - Begin watching battery
- `getBattery` - Return current battery state

---

### `sounds/notification.wav`

**Purpose**: The alert sound that plays with notifications.

**Behavior**: Plays 2 times with a 2-second gap between plays.

---

### `icons/`

**Purpose**: Extension icons for various contexts.

| File        | Size    | Used For                  |
| ----------- | ------- | ------------------------- |
| icon16.png  | 16×16   | Toolbar icon              |
| icon32.png  | 32×32   | Windows taskbar           |
| icon48.png  | 48×48   | Extensions page           |
| icon128.png | 128×128 | Web store, install dialog |
| icon.svg    | Vector  | Source file               |

## Installation

### For Microsoft Edge

1. Navigate to `edge://extensions/`
2. Enable **Developer mode** (left sidebar)
3. Click **Load unpacked**
4. Select the extension folder
5. Pin the extension to your toolbar

### For Google Chrome

1. Navigate to `chrome://extensions/`
2. Enable **Developer mode** (top-right)
3. Click **Load unpacked**
4. Select the extension folder
5. Pin the extension to your toolbar

## Usage

1. **Click the extension icon** in your toolbar
2. **Click "Enable"** to prevent sleep
3. **Green "ON" badge** appears on the icon
4. **Use "Test Notification"** to verify sound works
5. **Click "Disable"** when done

### Notifications You'll Receive

| Trigger         | When                | Message                                          |
| --------------- | ------------------- | ------------------------------------------------ |
| 🔋 Low Battery  | < 20% and unplugged | "Consider charging your device"                  |
| 🔌 Full Battery | > 95% and charging  | "Consider unplugging to preserve battery health" |
| ⚡ Toggle On    | Extension enabled   | "Your computer will stay awake"                  |
| ⚡ Toggle Off   | Extension disabled  | "Your computer can sleep normally"               |

## Permissions Explained

| Permission      | Why Needed                                    |
| --------------- | --------------------------------------------- |
| `power`         | Core functionality - prevents system sleep    |
| `notifications` | Show alerts for battery and status changes    |
| `storage`       | Remember enabled/disabled state               |
| `offscreen`     | Create hidden document for audio & battery    |
| `alarms`        | Keep service worker alive with periodic pings |

## Technical Details

- **Manifest Version**: 3 (latest standard)
- **Compatibility**: Chrome 109+, Edge 109+, Brave, Opera, Vivaldi
- **Service Worker**: Persistent via alarms (1-minute keepalive)
- **Sound Loop**: 2 plays × 2-second interval

### APIs Used

| API                      | Purpose                                     |
| ------------------------ | ------------------------------------------- |
| Chrome Power API         | `requestKeepAwake()` / `releaseKeepAwake()` |
| Chrome Notifications API | Desktop notifications                       |
| Chrome Storage API       | Persist user preferences                    |
| Chrome Offscreen API     | Create hidden document                      |
| Chrome Alarms API        | Keep service worker active                  |
| Chrome Action API        | Toolbar badge ("ON" indicator)              |
| Web Battery API          | Monitor battery level/charging              |
| Web Audio API            | Play notification sounds                    |

## Troubleshooting

| Issue                       | Solution                                 |
| --------------------------- | ---------------------------------------- |
| Extension blocked by policy | Use personal browser profile or try Edge |
| No sound playing            | Check system volume, test with button    |
| Battery info not showing    | Only works on laptops with batteries     |
| Icon not visible            | Click puzzle icon → pin the extension    |
| Notifications not appearing | Check browser notification settings      |

## Notes

- Extension only works while browser is running
- Desktop PCs without batteries won't show battery info
- Sound requires offscreen document (Manifest V3 limitation)
- Works on all Chromium-based browsers

## License

MIT License - Feel free to modify and use as needed!
