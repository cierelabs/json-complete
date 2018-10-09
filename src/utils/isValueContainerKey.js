const valueContainerKeys = {
    'da': 1, // Date
    're': 1, // Regex
    'fu': 1, // Function
    'BO': 1, // Object-wrapped Boolean
    'NM': 1, // Object-wrapped Number
    'ST': 1, // Object-wrapped String
    'Se': 1, // Set
    'Ma': 1, // Map
};

module.exports = (pointerKey) => {
    return Boolean(valueContainerKeys[pointerKey]);
};
