// Create a custom DevTools panel
chrome.devtools.panels.create(
  "damn.js",
  "",
  "../panel/panel.html",
  function(panel) {
    // Panel created successfully
  }
);
