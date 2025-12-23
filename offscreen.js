// Offscreen document for playing audio

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "playSound") {
    playNotificationSound();
    sendResponse({ success: true });
  }
  return true;
});

function playNotificationSound() {
  const audio = document.getElementById("notificationSound");
  audio.currentTime = 0;
  audio.play().catch((error) => {
    console.error("Error playing sound:", error);
  });
}
