import pointers from '/pointers.js';

const tryGetExistingPointer = (data, value, pointerKey) => {
    // Simple PointerKeys are their own Pointers
    if (pointers.isSimplePointerKey(pointerKey)) {
        return pointerKey;
    }

    // Ensure the ref list exists
    data._.known[pointerKey] = data._.known[pointerKey] || [];

    // Try to find existing item matching the value
    const foundItem = data._.known[pointerKey].find((refItem) => {
        return refItem.ref === value;
    });

    // If found, return its existing pointer
    if (foundItem) {
        return foundItem.pointer;
    }

    return void 0;
};

const genItem = (value, pointerKey, pointerIndex) => {
    // Add to list of known items so references will point to the same value
    return {
        ref: value,
        pointerKey: pointerKey,
        pointerIndex: pointerIndex,
        pointer: pointers.genIndexedPointer(pointerKey, pointerIndex),
    };
}

const encounterNewValue = (data, value, pointerKey, pointerIndex) => {
    const item = genItem(value, pointerKey, pointerIndex);

    // Add to list of known items so references will point to the same value
    data._.known[pointerKey].push(item);

    return item.pointer;
};

const encounterNewContainer = (data, value, pointerKey, pointerIndex) => {
    const item = genItem(value, pointerKey, pointerIndex);

    // Add to list of known items so references will point to the same value
    data._.known[pointerKey].push(item);
    data._.exploreQueue.push(item);

    return item.pointer;
};

const basicEncode = (data, value, pointerKey) => {
    data[pointerKey] = data[pointerKey] || [];
    const pointerIndex = data[pointerKey].length;

    // Store value at correct location
    data[pointerKey][pointerIndex] = value;

    return encounterNewValue(data, value, pointerKey, pointerIndex);
};

const encoders = {
    'nm': basicEncode,
    'st': basicEncode,
    're': (data, value, pointerKey) => {
        const encodedValue = [
            value.source,
            value.flags,
            value.lastIndex,
        ];

        data[pointerKey] = data[pointerKey] || [];
        const pointerIndex = data[pointerKey].length;

        // Encode as number, or string if Invalid Date
        data[pointerKey][pointerIndex] = encode(data, encodedValue);

        return encounterNewValue(data, value, pointerKey, pointerIndex);
    },
    'da': (data, value, pointerKey) => {
        let encodedValue = value.getTime();

        // Invalid Dates return NaN from getTime()
        if (encodedValue !== encodedValue) {
            // Encode as non-number value, which will generate an Invalid Date when converted
            encodedValue = '';
        }

        data[pointerKey] = data[pointerKey] || [];
        const pointerIndex = data[pointerKey].length;

        // Encode as number, or string if Invalid Date
        data[pointerKey][pointerIndex] = encode(data, encodedValue);

        return encounterNewValue(data, value, pointerKey, pointerIndex);
    },
    'sy': (data, value, pointerKey) => {
        const symbolStringKey = Symbol.keyFor(value);

        // Keyed Symbol, encode as key string
        // Unique Symbol, encode as zero number
        const encodedValue = symbolStringKey !== void 0 ? symbolStringKey : 0;

        data[pointerKey] = data[pointerKey] || [];
        const pointerIndex = data[pointerKey].length;

        data[pointerKey][pointerIndex] = encode(data, encodedValue);

        return encounterNewValue(data, value, pointerKey, pointerIndex);
    },
    'fu': (data, value, pointerKey) => {
        const functionString = String(value);

        data[pointerKey] = data[pointerKey] || [];
        const pointerIndex = data[pointerKey].length;

        data[pointerKey][pointerIndex] = encode(data, functionString);

        return encounterNewValue(data, value, pointerKey, pointerIndex);
    },
    'ob': (data, obj, pointerKey) => {
        data[pointerKey] = data[pointerKey] || [];

        // As a container type, it might already have been encountered, so we use the existing PointerIndex if available
        const existingPointer = tryGetExistingPointer(data, obj, pointerKey);

        let pointer;
        let pointerIndex;

        if (existingPointer) {
            pointerIndex = pointers.extractPointerIndex(existingPointer);
            pointer = existingPointer;
        }
        else {
            pointerIndex = data[pointerKey].length;
            pointer = encounterNewValue(data, obj, pointerKey, pointerIndex);
        }

        data[pointerKey][pointerIndex] = data[pointerKey][pointerIndex] || [];
        const container = data[pointerKey][pointerIndex];

        Object.keys(obj).concat(Object.getOwnPropertySymbols(obj)).forEach((key) => {
            const value = obj[key];
            let valuePointer;

            const valuePointerKey = pointers.getPointerKey(value);
            const existingPointer = tryGetExistingPointer(data, value, valuePointerKey);

            if (existingPointer) {
                valuePointer = existingPointer;
            }
            else if (pointers.isContainerPointerKey(valuePointerKey)) {
                // Only allow one-level-deep container exploration by using the exploreQueue, otherwise circular references can cause infinite loops
                data[valuePointerKey] = data[valuePointerKey] || [];
                valuePointer = encounterNewContainer(data, value, valuePointerKey, data[valuePointerKey].length);
                data[valuePointerKey][data[valuePointerKey].length] = [];
            }
            else {
                valuePointer = encode(data, value);
            }

            container.push([
                encode(data, key),
                valuePointer,
            ]);
        });

        return pointer;
    },
    'ar': (data, arr, pointerKey) => {
        data[pointerKey] = data[pointerKey] || [];

        // As a container type, it might already have been encountered, so we use the existing PointerIndex if available
        const existingPointer = tryGetExistingPointer(data, arr, pointerKey);

        let pointer;
        let pointerIndex;

        if (existingPointer) {
            pointerIndex = pointers.extractPointerIndex(existingPointer);
            pointer = existingPointer;
        }
        else {
            pointerIndex = data[pointerKey].length;
            pointer = encounterNewValue(data, arr, pointerKey, pointerIndex);
        }

        data[pointerKey][pointerIndex] = data[pointerKey][pointerIndex] || [];
        const container = data[pointerKey][pointerIndex];

        arr.forEach((value, index) => {
            let valuePointer;

            const valuePointerKey = pointers.getPointerKey(value);
            const existingPointer = tryGetExistingPointer(data, value, valuePointerKey);

            if (existingPointer) {
                valuePointer = existingPointer;
            }
            else if (pointers.isContainerPointerKey(valuePointerKey)) {
                // Only allow one-level-deep container exploration by using the exploreQueue, otherwise circular references can cause infinite loops
                data[valuePointerKey] = data[valuePointerKey] || [];
                valuePointer = encounterNewContainer(data, value, valuePointerKey, data[valuePointerKey].length);
                data[valuePointerKey][data[valuePointerKey].length] = [];
            }
            else {
                valuePointer = encode(data, value);
            }

            container.push([
                encode(data, index),
                valuePointer,
            ]);
        });

        return pointer;
    },
};

export const encode = (data, value) => {
    const pointerKey = pointers.getPointerKey(value);

    // Containers values need to handle their own existing Pointer handling
    if (!pointers.isContainerPointerKey(pointerKey)) {
        const existingPointer = tryGetExistingPointer(data, value, pointerKey);

        // If found, return its existing pointer
        if (existingPointer) {
            return existingPointer;
        }
    }

    // This newly encountered item should be encoded and stored, then return the created pointer
    // Container types will also add themselves to the exploreQueue for later evaluation
    return encoders[pointerKey](data, value, pointerKey);
};

export default {
    encode: encode,
};