chrome.devtools.panels.create(
  "damn.js",
  "icons/icon.png",
  "panel/panel.html",
  (panel) => {
    console.log("damn.js panel created");
  }
);