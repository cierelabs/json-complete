import getSystemName from '/utils/getSystemName.js';

const canUseNormalMap = (encodeSymbolKeys) => {
    // Map not supported at all or is some kind of polyfill, ignore
    if (typeof Map !== 'function' || getSystemName(new Map()) !== 'Map') {
        return false;
    }

    // Even though Maps are supported, Symbols are not supported at all or we are ignoring Symbol keys, so assume Map works normally
    // Even if Symbols are used after this point, it will error out somewhere else anyway
    if (typeof Symbol !== 'function' || getSystemName(Symbol()) !== 'Symbol' || !encodeSymbolKeys) {
        return true;
    }

    // Versions of Microsoft Edge before 18 support both Symbols and Maps, but can occasionally (randomly) allow Map keys to be duplicated if they are obtained from Object keys
    // Here, the code statistically attempts to detect the possibility of key duplication
    // With 50 set operations, the chances of a successfully detecting this failure case is at least 99.999998% likely
    // https://github.com/Microsoft/ChakraCore/issues/5852
    const obj = {};
    obj[Symbol()] = 1;
    const box = new Map();
    for (let i = 0; i < 50; i += 1) {
        box.set(Object.getOwnPropertySymbols(obj)[0], {});
    }

    return box.size === 1;
};

export default (encodeSymbolKeys) => {
    // TODO: Exclude entirely from legacy version
    // For modern browsers that both support Map and won't be tripped up by special kinds of Symbol keys, using a Map to store the references is far faster than an array because it allows for roughly O(1) lookup time when checking for duplicate keys
    if (canUseNormalMap(encodeSymbolKeys)) {
        const references = new Map();

        return {
            _get(item) {
                return references.get(item);
            },
            _set(item, dataItem) {
                if (!references.get(item)) {
                    references.set(item, dataItem);
                }
            },
            _forEach(callback) {
                references.forEach(callback);
            },
        };
    }

    // In the fallback legacy mode, uses an array instead of a Map
    // The items cannot be broken up by type, because their insertion order matters to the algorithm
    // There were plans to make the array "infinite" in size by making nested arrays, however even under the smallest forms of objects, browsers can't get anywhere near full array usage before running out of memory and crashing the page

    const items = [];
    const dataItems = [];

    const get = (item) => {
        for (let i = 0; i < items.length; i += 1) {
            if (items[i] === item) {
                return dataItems[i];
            }
        }
    };

    return {
        _get: get,
        _set (item, dataItem) {
            if (!get(item)) {
                items.push(item);
                dataItems.push(dataItem);
            }
        },
        _forEach (callback) {
            for (let i = 0; i < dataItems.length; i += 1) {
                callback(dataItems[i]);
            }
        },
    };
};
