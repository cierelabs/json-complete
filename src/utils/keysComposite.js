// Composite types have a value, made up of other types, that must be manually encoded and decoded
// This is above and beyond any attachment values
module.exports = {
    'da': 1, // Date
    'sy': 1, // Symbol
    're': 1, // Regex
    // 'ar': 1, // Array
    'fu': 1, // Function
    'er': 1, // Error
    'BO': 1, // Object-wrapped Boolean
    'NM': 1, // Object-wrapped Number
    'ST': 1, // Object-wrapped String
    'AB': 1, // ArrayBuffer
    'SA': 1, // SharedArrayBuffer
    'I1': 1, // Int8Array
    'U1': 1, // Uint8Array
    'C1': 1, // Uint8ClampedArray
    'I2': 1, // Int16Array
    'U2': 1, // Uint16Array
    'I3': 1, // Int32Array
    'U3': 1, // Uint32Array
    'F3': 1, // Float32Array
    'F4': 1, // Float64Array
    'Se': 1, // Set
    'Ma': 1, // Map
    'Bl': 1, // Blob
    'Fi': 1, // File
};
