/*
This Script is used for error detection and broadcasting.

1) Finds the error.
   Currently finds three main types of errors,
   - Manual logs (done using console.error)
   - Synchronous runtime errors (undefined, throw and more)
   - Unhandled promises (fetch without try catch)

2) Captures the error 
3) Stores them locally in "errorHistory"
4) Broadcasts the errors using "window.postMessage"
*/

(function () {
    // Store for errors (for Spell button to reference ones)
    // This will be used as reference in chat
    const errorHistory = []
    const MAX_HISTORY = 50;

    // 1. Hook console.error
    // This captures error manually logged by the developer using "console.error"
    const originalError = console.error;

    console.error = function (...args) {
        const message = args.map(arg => {
            if (typeof arg == 'object') return JSON.stringify(arg);
            return String(arg);
        }).join(' ');


        const error = {
            id: Date.now() + Math.random(),
            type: 'console.error',
            message: message,
            stack: new Error().stack,
            timestamp: new Date().toISOString(),
            context: {
                url: window.location.href,
                userAgent: navigator.userAgent
            }
        };


        errorHistory.push(error);

        if (errorHistory.length > MAX_HISTORY) errorHistory.shift();

        window.postMessage({
            type: 'DAMN_ERROR',
            source: 'injected',
            data: error
        }, '*');

        return originalError.apply(console, args);
    };


    // 2. Hook window.onerror
    // Captures code crashing bugs or mistakes (undefined, null, Parsing errors, thrown Errors)
    window.addEventListener('error', (event) => {
        const error = {
            id: Date.now() + Math.random(),
            type: 'window.onerror',
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error ? event.error.stack : 'No stack trace',
            timestamp: new Date().toISOString(),
            context: {
                url: window.location.href,
                userAgent: navigator.userAgent
            }
        };

        errorHistory.push(error);
        if (errorHistory.length > MAX_HISTORY) {
            errorHistory.shift();
        }

        window.postMessage({
            type: 'DAMN_ERROR',
            source: 'injected',
            data: error
        }, '*');
    });

    // 3. Hook unhandled promise rejections
    // Captures Async/Promise errors such as async without try catch, promise.reject without handler
    window.addEventListener('unhandledrejection', (event) => {
        const error = {
            id: Date.now() + Math.random(),
            type: 'unhandledRejection',
            message: String(event.reason),
            stack: event.reason && event.reason.stack ? event.reason.stack: 'No stack trace',
            timestamp: new Date().toISOString(),
            context: {
                url: window.location.href,
                userAgent: navigator.userAgent
            }
        };

        errorHistory.push(error);
        if(errorHistory.length > MAX_HISTORY) {
            errorHistory.shift();
        }

        window.postMessage({
            type: 'DAMN_ERROR',
            source: 'injected',
            data: error
        }, '*');
    });

    // Creates a global variable and stores the errorHistory 
    window.__damnErrorHistory = errorHistory;

})();