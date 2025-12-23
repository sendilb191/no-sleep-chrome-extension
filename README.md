# ⚡ No Sleep Chrome Extension

A Chrome extension that prevents your computer from sleeping by keeping Chrome active in the background. Includes sound notifications for battery alerts.

## Features

✅ **Runs in background continuously** - Service worker keeps running even when you close the popup  
✅ **Battery API integration** - Monitors battery level and charging status  
✅ **Sound notifications** - Plays audio alerts with system notifications  
✅ **Low battery warning** - Alerts when battery drops below 20% (not charging)  
✅ **Full battery alert** - Alerts when battery is above 95% (while charging)  
✅ **Works across all apps/tabs** - Prevents sleep system-wide while Chrome is running  
✅ **Simple toggle interface** - Easy one-click enable/disable

## How It Works

### Core Functionality

- Uses Chrome's `power` API with `requestKeepAwake('system')` to prevent sleep
- Prevents both display and system sleep when enabled
- Persists your enable/disable preference using Chrome's storage API

### Battery Monitoring

- Uses the Battery Status API to monitor battery level and charging state
- Triggers notifications on battery level or charging status changes
- Low battery warning: < 20% and not charging
- Full battery alert: > 95% and charging

### Sound Notifications

- Uses Chrome's Offscreen API to play audio (required in Manifest V3)
- Service workers cannot play audio directly, so an offscreen document handles playback
- Custom notification sound plays alongside Chrome notifications

## Project Structure

```
├── manifest.json      # Extension configuration & permissions
├── background.js      # Service worker - main logic, battery monitoring, notifications
├── popup.html         # Extension popup UI (HTML)
├── popup.js           # Popup UI controller (toggle, status display)
├── offscreen.html     # Hidden document for audio playback
├── offscreen.js       # Audio player script
├── sounds/
│   └── notification.wav  # Notification sound file
├── icons/
│   ├── icon.svg       # Source icon
│   ├── icon16.png     # 16x16 icon
│   ├── icon32.png     # 32x32 icon
│   ├── icon48.png     # 48x48 icon
│   └── icon128.png    # 128x128 icon
└── README.md          # This file
```

## File Descriptions

### `manifest.json`

Extension configuration file that defines:

- Permissions: `power`, `notifications`, `storage`, `offscreen`
- Background service worker registration
- Popup action and icons

### `background.js`

The main service worker that runs continuously:

- **State Management**: Tracks enabled/disabled state, battery info
- **Power Control**: `enableNoSleep()` / `disableNoSleep()` functions
- **Battery Monitoring**: `monitorBattery()` uses Battery API with event listeners
- **Notifications**: `showNotification()` displays alerts with sound
- **Offscreen Audio**: `setupOffscreenDocument()` and `playNotificationSound()` handle audio
- **Keep Alive**: Uses Chrome alarms to prevent service worker termination

### `popup.html` & `popup.js`

The user interface when clicking the extension icon:

- Shows current status (active/inactive)
- Displays battery level and charging status
- Toggle button to enable/disable

### `offscreen.html` & `offscreen.js`

Hidden document for audio playback (Manifest V3 requirement):

- Receives `playSound` messages from background script
- Plays the notification.wav file
- Required because service workers cannot access Audio API

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select this extension folder
5. The extension icon should appear in your toolbar

### Icons Setup

The extension requires PNG icons. You can:

- Convert `icons/icon.svg` to PNG (16x16, 32x32, 48x48, 128x128)
- Or use any icon images named `icon16.png`, `icon32.png`, etc.

## Usage

1. Click the extension icon in your toolbar
2. Click "Enable" to prevent your computer from sleeping
3. The status shows "Active - Computer Won't Sleep"
4. Battery info displays if available
5. Click "Disable" to allow normal sleep behavior

You'll receive sound notifications when:

- 🔋 Battery drops below 20% (not charging)
- 🔌 Battery exceeds 95% (while charging)
- ⚡ You toggle the extension on/off

## Permissions Explained

| Permission      | Purpose                                   |
| --------------- | ----------------------------------------- |
| `power`         | Prevent system from sleeping              |
| `notifications` | Display system notifications              |
| `storage`       | Save enable/disable preference            |
| `offscreen`     | Create hidden document for audio playback |

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Service Worker**: Persistent background script
- **APIs Used**:
  - Chrome Power API
  - Chrome Notifications API
  - Chrome Storage API
  - Chrome Offscreen API
  - Battery Status API (Web API)
  - Chrome Alarms API

## Notes

- Extension only works when Chrome is running
- Battery API may not work on desktop PCs without batteries
- Service worker stays active using periodic alarms (1-minute interval)
- Sound plays through offscreen document (Manifest V3 limitation)

## License

MIT License - Feel free to modify and use as needed!
