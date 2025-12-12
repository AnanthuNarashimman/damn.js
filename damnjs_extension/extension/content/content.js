// Listen for postMessage from injected script

// Listens for the message broadcasted in injected script
window.addEventListener('message', (event) => {

    // There may be multiple messages from various sources(iframes, malicious scripts)
    // This step checks such messages and filters the messages
    if(event.source !==window) return;
    if(event.data.type !== 'DAMN_ERROR') return;

    // Checks if the extension is enabled and functioning
    if(chrome.runtime) {
        chrome.runtime.sendMessage({
            type: 'FORWARD_ERROR',
            data: event.data.data
        }).catch(err => {
            // Silently fails if Devtools not open
        });
    }
});