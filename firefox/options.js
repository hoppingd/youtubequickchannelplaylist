// options.js
document.addEventListener('DOMContentLoaded', () => {
  const checkbox = document.getElementById('shortsToggle');

  // Load the saved setting
  chrome.storage.local.get(['shortsToggle'], (result) => {
    checkbox.checked = result.shortsToggle || false;
  });

  // Save the setting when changed
  checkbox.addEventListener('change', () => {
    chrome.storage.local.set({ shortsToggle: checkbox.checked });
  });
});