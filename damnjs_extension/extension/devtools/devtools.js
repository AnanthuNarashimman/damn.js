// Create damn.js DevTools panel
chrome.devtools.panels.create(
  "damn.js",                // The name shown in DevTools tab
  "",                       // Optional icon path (leave empty for now)
  "../panel/panel.html",    // The UI page for your assistant
  function (panel) {
    console.log("damn.js panel loaded");
  }
);
