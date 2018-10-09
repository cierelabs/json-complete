const containerKeys = {
    'da': 1, // Date
    're': 1, // Regex
    'fu': 1, // Function
    'ob': 1, // Object
    'ar': 1, // Array
    'BO': 1, // Object-wrapped Boolean
    'NM': 1, // Object-wrapped Number
    'ST': 1, // Object-wrapped String
    'I1': 1, // Int8Array
    'U1': 1, // Uint8Array
    'C1': 1, // Uint8ClampedArray
    'I2': 1, // Int16Array
    'U2': 1, // Uint16Array
    'I3': 1, // Int32Array
    'U3': 1, // Uint32Array
    'F3': 1, // Float32Array
    'F4': 1, // Float64Array
    'AB': 1, // ArrayBuffer
    'Ma': 1, // Map
    'Se': 1, // Set
};

module.exports = (pointerKey) => {
    return Boolean(containerKeys[pointerKey]);
};
