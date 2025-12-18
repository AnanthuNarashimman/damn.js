// Background script to handle tab ID requests from content scripts

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_TAB_ID') {
    // Return the tab ID of the sender
    if (sender.tab && sender.tab.id) {
      sendResponse({ tabId: sender.tab.id });
    } else {
      sendResponse({ tabId: null });
    }
    return true; // Keep the message channel open for async response
  }
});
