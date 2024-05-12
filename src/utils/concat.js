export function concatenateAllStrings(obj) {
    let concatenatedString = '';

    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            try {
                const value = obj[key];
                if (typeof value === 'string') {
                    concatenatedString += value + ' ';
                } else if (Array.isArray(value)) {
                    value.forEach(item => {
                        concatenatedString += concatenateAllStrings(item);
                    });
                } else if (typeof value === 'object' && value !== null) {
                    concatenatedString += concatenateAllStrings(value);
                }
            } catch (error) {
                console.error("Error while processing object:", error);
                // concatenatedString = ''; // Reset concatenatedString if error occurs
            }
        }
    }

    return concatenatedString.trim()
}