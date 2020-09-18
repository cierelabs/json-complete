import getSystemName from '/utils/getSystemName.js';

let canUseNormalMap = (encodeSymbolKeys) => {
    // Map not supported at all or is some kind of polyfill, ignore
    if (typeof Map !== 'function' || getSystemName(new Map()) !== 'Map') {
        return false;
    }

    // Safari 14, which supports BigInts for the first time, can non-deterministically save duplicate keys in maps for the same value BigInt
    // This test should be forwards compatible with future versions of Safari that fix this.
    // https://bugs.webkit.org/show_bug.cgi?id=216667
    if (typeof BigInt === 'function' && getSystemName(BigInt(1)) === 'BigInt') {
        const box = new Map();
        for (let i = 0; i < 10; i += 1) {
            box.set(BigInt(1), i);
        }

        if (box.size !== 1) {
            return false;
        }
    }

    // Versions of Microsoft Edge before 18 support both Symbols and Maps, but can occasionally (randomly) allow Map keys to be duplicated if they are obtained from Object keys
    // Here, the code statistically attempts to detect the possibility of key duplication
    // With 50 set operations, the chances of a successfully detecting this failure case is at least 99.999998% likely
    // https://github.com/Microsoft/ChakraCore/issues/5852
    if (encodeSymbolKeys && typeof Symbol === 'function' && getSystemName(Symbol()) === 'Symbol') {
        const obj = {};
        obj[Symbol()] = 1;
        const box = new Map();
        for (let i = 0; i < 50; i += 1) {
            box.set(Object.getOwnPropertySymbols(obj)[0], {});
        }

        if (box.size !== 1) {
            return false;
        }
    }

    return true;
};

export default (encodeSymbolKeys) => {
    // TODO: Exclude entirely from legacy version
    // For modern browsers that both support Map and won't be tripped up by special kinds of Symbol keys, using a Map to store the references is far faster than an array because it allows for roughly O(1) lookup time when checking for duplicate keys
    if (canUseNormalMap(encodeSymbolKeys)) {
        const references = new Map();

        return {
            _get: (item) => {
                return references.get(item);
            },
            _set: (item, dataItem) => {
                references.set(item, dataItem);
            },
            _resumableForEach: (callback, resumeFromIndex) => {
                resumeFromIndex = resumeFromIndex || 0;
                let count = 0;

                references.forEach((dataItem) => {
                    // count will never be greater than resumeFromIndex when not encoding a deferred type, which Node doesn't support
                    /* istanbul ignore else */
                    if (count >= resumeFromIndex) {
                        callback(dataItem);
                    }
                    count += 1;
                });

                return count;
            },
        };
    }

    // In the fallback legacy mode, uses an array instead of a Map
    // The items cannot be broken up by type, because their insertion order matters to the algorithm
    // There were plans to make the array "infinite" in size by making nested arrays, however even under the smallest forms of objects, browsers can't get anywhere near full array usage before running out of memory and crashing the page

    const items = [];
    const dataItems = [];

    return {
        _get: (item) => {
            for (let i = 0; i < items.length; i += 1) {
                if (items[i] === item) {
                    return dataItems[i];
                }
            }
        },
        _set: (item, dataItem) => {
            items.push(item);
            dataItems.push(dataItem);
        },
        _resumableForEach: (callback, resumeFromIndex) => {
            let count;

            for (count = resumeFromIndex || 0; count < dataItems.length; count += 1) {
                callback(dataItems[count]);
            }

            return count;
        },
    };
};
