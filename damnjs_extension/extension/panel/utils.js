// utility functions

const utils = {

    // function to convert date-time objects into local time strings
    formatTimeStamp(iso) {
        return new Date(iso).toLocaleTimeString();
    },

    // function to string long error messages
    truncate(str, maxLen = 100) {
        return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
    }
};