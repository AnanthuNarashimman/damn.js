/*
This script runs inside the page context, not the extension content-script context.

It watches several browser error sources, normalizes them into one error object,
keeps a small in-page history, and broadcasts each error to content/content.js
with window.postMessage.
*/

(function () {
    // Store recent errors for anything that needs local page-side history.
    const errorHistory = [];
    const MAX_HISTORY = 50;

    // Keep references to browser APIs before we wrap them.
    const originalConsole = {};
    const originalFetch = window.fetch;
    const OriginalXMLHttpRequest = window.XMLHttpRequest;

    /*
    Converts any JavaScript value into a readable string.
    This avoids crashing the logger when console/error payloads contain objects,
    circular references, Error instances, null, or undefined.
    */
    function stringifyValue(value) {
        if (value instanceof Error) {
            return value.message || value.toString();
        }

        if (typeof value === 'string') {
            return value;
        }

        if (value === null || value === undefined) {
            return String(value);
        }

        if (typeof value === 'object') {
            try {
                return JSON.stringify(value);
            } catch (err) {
                return Object.prototype.toString.call(value);
            }
        }

        return String(value);
    }

    function getStackFromValue(value) {
        return value && value.stack ? value.stack : 'No stack trace';
    }

    function getRequestUrl(input) {
        if (typeof input === 'string') {
            return input;
        }

        if (input && input.url) {
            return input.url;
        }

        return stringifyValue(input);
    }

    /*
    One central capture function for every error source.
    Each hook passes only the details it knows; this function adds shared fields,
    stores the error, and broadcasts it to the extension content script.
    */
    function captureError(type, details) {
        const error = {
            id: Date.now() + Math.random(),
            type: type,
            message: details.message || 'Unknown error',
            stack: details.stack || 'No stack trace',
            timestamp: new Date().toISOString(),
            context: {
                url: window.location.href,
                userAgent: navigator.userAgent
            }
        };

        Object.keys(details).forEach((key) => {
            if (key !== 'message' && key !== 'stack') {
                error[key] = details[key];
            }
        });

        errorHistory.push(error);
        if (errorHistory.length > MAX_HISTORY) {
            errorHistory.shift();
        }

        window.postMessage({
            type: 'DAMN_ERROR',
            source: 'injected',
            data: error
        }, '*');

        return error;
    }

    /*
    1. Console hooks
    Captures manual logs from page code while preserving the browser's original
    console behavior.
    */
    ['error', 'warn', 'assert'].forEach((level) => {
        originalConsole[level] = console[level];

        console[level] = function (...args) {
            // console.assert only reports when the first argument is falsy.
            if (level === 'assert' && args[0]) {
                return originalConsole[level].apply(console, args);
            }

            const messageArgs = level === 'assert' ? args.slice(1) : args;
            const message = messageArgs.map(stringifyValue).join(' ') || `console.${level}`;

            captureError(`console.${level}`, {
                message: message,
                stack: new Error().stack,
                consoleArgs: messageArgs.map(stringifyValue)
            });

            return originalConsole[level].apply(console, args);
        };
    });

    /*
    2. Runtime errors and resource loading errors
    - Runtime errors: thrown exceptions, ReferenceError, TypeError, etc.
    - Resource errors: failed <script>, <img>, <link>, <iframe>, etc.
    The capture phase is important because many resource load errors do not bubble.
    */
    window.addEventListener('error', (event) => {
        const target = event.target;

        if (target && target !== window) {
            const resourceUrl = target.src || target.href || target.currentSrc || null;

            captureError('resource.error', {
                message: `Failed to load resource: ${resourceUrl || target.tagName}`,
                filename: resourceUrl,
                tagName: target.tagName,
                stack: 'No stack trace'
            });

            return;
        }

        captureError('window.onerror', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error ? event.error.stack : 'No stack trace'
        });
    }, true);

    /*
    3. Unhandled promise rejections
    Captures rejected promises that have no catch handler.
    */
    window.addEventListener('unhandledrejection', (event) => {
        captureError('unhandledRejection', {
            message: stringifyValue(event.reason),
            stack: getStackFromValue(event.reason),
            reason: stringifyValue(event.reason)
        });
    });

    /*
    4. Content Security Policy violations
    Captures blocked scripts, styles, connections, images, and other CSP failures.
    */
    window.addEventListener('securitypolicyviolation', (event) => {
        captureError('securitypolicyviolation', {
            message: `CSP violation: ${event.violatedDirective || event.effectiveDirective}`,
            blockedURI: event.blockedURI,
            violatedDirective: event.violatedDirective,
            effectiveDirective: event.effectiveDirective,
            sourceFile: event.sourceFile,
            lineno: event.lineNumber,
            colno: event.columnNumber,
            stack: 'No stack trace'
        });
    });

    /*
    5. Fetch failures
    Captures both network exceptions and HTTP error responses.
    The original response is still returned so page behavior does not change.
    */
    if (typeof originalFetch === 'function') {
        window.fetch = async function (...args) {
            try {
                const response = await originalFetch.apply(this, args);

                /*
                A fetch Response with status 0 is usually not a normal HTTP
                failure. It often means an opaque no-cors response where the
                browser hides the real status from JavaScript.
                */
                if (response.status === 0) {
                    if (response.type !== 'opaque' && response.type !== 'opaqueredirect') {
                        captureError('fetch.status0', {
                            message: `Fetch returned status 0 (${response.type || 'unknown response type'})`,
                            request: getRequestUrl(args[0]),
                            status: response.status,
                            statusText: response.statusText,
                            responseType: response.type,
                            stack: new Error().stack
                        });
                    }
                } else if (!response.ok) {
                    captureError('fetch.error', {
                        message: `Fetch failed: ${response.status} ${response.statusText}`,
                        request: getRequestUrl(args[0]),
                        status: response.status,
                        statusText: response.statusText,
                        responseType: response.type,
                        stack: new Error().stack
                    });
                }

                return response;
            } catch (err) {
                captureError('fetch.exception', {
                    message: stringifyValue(err),
                    request: getRequestUrl(args[0]),
                    stack: getStackFromValue(err)
                });

                throw err;
            }
        };
    }

    /*
    6. XMLHttpRequest failures
    Captures legacy AJAX failures. This records failed status codes plus network,
    timeout, and abort events while still using the browser's real XHR object.
    */
    if (typeof OriginalXMLHttpRequest === 'function') {
        window.XMLHttpRequest = function () {
            const xhr = new OriginalXMLHttpRequest();
            let method = 'GET';
            let url = 'Unknown URL';

            const originalOpen = xhr.open;

            xhr.open = function (xhrMethod, xhrUrl, ...rest) {
                method = xhrMethod;
                url = stringifyValue(xhrUrl);
                return originalOpen.call(xhr, xhrMethod, xhrUrl, ...rest);
            };

            xhr.addEventListener('loadend', () => {
                if (xhr.status >= 400) {
                    captureError('xhr.error', {
                        message: `XHR failed: ${xhr.status} ${xhr.statusText}`,
                        method: method,
                        request: url,
                        status: xhr.status,
                        statusText: xhr.statusText,
                        stack: new Error().stack
                    });
                }
            });

            xhr.addEventListener('error', () => {
                captureError('xhr.exception', {
                    message: `XHR network error: ${method} ${url}`,
                    method: method,
                    request: url,
                    stack: new Error().stack
                });
            });

            xhr.addEventListener('timeout', () => {
                captureError('xhr.timeout', {
                    message: `XHR timeout: ${method} ${url}`,
                    method: method,
                    request: url,
                    stack: new Error().stack
                });
            });

            xhr.addEventListener('abort', () => {
                captureError('xhr.abort', {
                    message: `XHR aborted: ${method} ${url}`,
                    method: method,
                    request: url,
                    stack: new Error().stack
                });
            });

            return xhr;
        };

        window.XMLHttpRequest.prototype = OriginalXMLHttpRequest.prototype;
    }

    // Expose the in-page history for debugging and future features.
    window.__damnErrorHistory = errorHistory;
})();
