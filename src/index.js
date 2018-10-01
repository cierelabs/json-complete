import pointers from '/pointers.js';
import encoders from '/encoders.js';
import generators from '/generators.js';

const encode = (value) => {
    const data = {
        root: void 0,
        _: {
            known: {},
            exploreQueue: [],
        },
    };

    // Initialize data from the top-most value
    data.root = encoders.encode(data, value);

    var temp = 1000;

    // While there are still references to explore, go through them
    while (data._.exploreQueue.length > 0 && temp--) {
        const refItem = data._.exploreQueue.shift();

        data[refItem.pointerKey] = data[refItem.pointerKey] || [];
        data[refItem.pointerKey][refItem.index] = encoders.encode(data, refItem.ref);
    }

    // console.log(temp)

    // Remove data used during encoding process
    delete data._;

    return data;
};

const decode = (encoded) => {
    const data = {
        _: {
            encoded: encoded,
            exploreQueue: [],
        },
    };

    // If root value is a not a container, return its value directly
    if (!pointers.isContainerPointerKey(pointers.extractPointerKey(encoded.root))) {
        return generators.generate(data, encoded.root);
    }

    data._.exploreQueue.push(encoded.root);

    var temp = 1000;

    while (data._.exploreQueue.length > 0 && temp--) {
        const pointer = data._.exploreQueue.shift();

        // Sanity checks
        const pointerKey = pointers.extractPointerKey(pointer);
        if (pointers.isSimplePointerKey(pointerKey)) {
            // Should never happen
            throw `Simple PointerKey was added to the exploreQueue, incorrectly. Pointer: ${pointer}`;
        }
        if (pointers.isValuePointerKey(pointerKey)) {
            // Should never happen
            throw `Value PointerKey was added to the exploreQueue, incorrectly. Pointer: ${pointer}`;
        }
        if (!pointers.isContainerPointerKey(pointerKey)) {
            // Should never happen
            throw `Unrecognized PointerKey type was added to the exploreQueue, incorrectly. Pointer: ${pointer}`;
        }

        generators.generate(data, pointer);
    }

    return data[pointers.extractPointerKey(encoded.root)][pointers.extractPointerIndex(encoded.root)];
};


// Tests

const isNanValue = (v) => {
    return Object.prototype.toString.call(v) === '[object Number]' && v !== v;
};

const isNegativeZero = (v) => {
    return v === -0 && (1 / v) === -Infinity
};

const isRegex = (v) => {
    return Object.prototype.toString.call(v) === '[object RegExp]';
};

const isSymbol = (v) => {
    return Object.prototype.toString.call(v) === '[object Symbol]';
};

const isFunction = (v) => {
    return Object.prototype.toString.call(v) === '[object Function]';
};

const isObject = (v) => {
    return Object.prototype.toString.call(v) === '[object Object]';
};

const isArray = (v) => {
    return Object.prototype.toString.call(v) === '[object Array]';
};

// Top Level Values
const topLevelValueTest = () => {
    // Simple values
    console.log(decode(encode(void 0)) === void 0);
    console.log(decode(encode(null)) === null);
    console.log(decode(encode(true)) === true);
    console.log(decode(encode(false)) === false);
    console.log(isNanValue(decode(encode(NaN))));
    console.log(decode(encode(Infinity)) === Infinity);
    console.log(decode(encode(-Infinity)) === -Infinity);
    console.log(isNegativeZero(decode(encode(-0))));

    // Numbers
    console.log(decode(encode(0)) === 0);
    console.log(decode(encode(0.0)) === 0);
    console.log(decode(encode(1)) === 1);
    console.log(decode(encode(-1)) === -1);
    console.log(decode(encode(1.0)) === 1);
    console.log(decode(encode(-1)) === -1.0);
    console.log(decode(encode(3.1415)) === 3.1415);

    // Strings
    console.log(decode(encode('')) === '');
    console.log(decode(encode('y')) === 'y');

    // Regex
    const regex = decode(encode(/\s+/g));
    console.log(regex.source === '\\s+');
    console.log(regex.flags === 'g');
    console.log(regex.lastIndex === 0);

    // Dates
    console.log(isNanValue(decode(encode(new Date(''))).getTime()));
    const now = Date.now();
    console.log(decode(encode(new Date(now))).getTime() === now);

    // Symbols
    const anonymousSymbol = Symbol();
    console.log(isSymbol(decode(encode(anonymousSymbol))));
    console.log(decode(encode(Symbol.for(''))) === Symbol.for(''));
    console.log(decode(encode(Symbol.for('x'))) === Symbol.for('x'));

    // Functions
    const anonymousFunction = decode(encode(() => { return 1; }));
    console.log(isFunction(anonymousFunction) && anonymousFunction() === 1);
};

// Numbers
const numbersTest = () => {
    console.log(decode(encode([1]))[0] === 1);
    console.log(decode(encode([0]))[0] === 0);
    console.log(decode(encode([-1]))[0] === -1);
    console.log(decode(encode([3.14]))[0] === 3.14);
};

// Strings
const stringsTest = () => {
    console.log(decode(encode(['']))[0] === '');
    console.log(decode(encode(['string']))[0] === 'string');
};

// Regex
const regexTest = () => {
    const sharedRegex = /\s+/g;
    const stickyUsed = /abc. /y;

    const stickyTestString = 'abcd abcx abcy';
    const initialStickyUse = stickyTestString.match(stickyUsed);

    console.log(initialStickyUse.length === 1);
    console.log(initialStickyUse[0] === 'abcd ');
    console.log(stickyUsed.lastIndex === 5);

    const regexObj = {
        a: sharedRegex,
        b: sharedRegex,
        diff: /\s+/g,
        stickyUnused: /abc. /y,
        stickyUsed: stickyUsed,
    };

    const decodedObj = decode(encode(regexObj));

    console.log(decodedObj.a.source === '\\s+');
    console.log(decodedObj.a.flags === 'g');
    console.log(decodedObj.a.lastIndex === 0);

    console.log(decodedObj.a === decodedObj.b);
    console.log(decodedObj.a !== decodedObj.diff);
    console.log('  a a a '.match(decodedObj.diff).length === 4);

    console.log(decodedObj.stickyUnused.lastIndex === 0);
    const secondaryStickyUse = stickyTestString.match(decodedObj.stickyUnused);
    console.log(secondaryStickyUse.length === 1);
    console.log(secondaryStickyUse[0] === 'abcd ');
    console.log(decodedObj.stickyUnused.lastIndex === 5);

    console.log(decodedObj.stickyUsed.lastIndex === 5);
    const secondInitialStickyUse = stickyTestString.match(decodedObj.stickyUsed);
    console.log(secondInitialStickyUse.length === 1);
    console.log(secondInitialStickyUse[0] === 'abcx ');
    console.log(decodedObj.stickyUsed.lastIndex === 10);
};

// Dates
const datesTest = () => {
    console.log(isNanValue(decode(encode([new Date('')]))[0].getTime()));
    const now = Date.now();
    console.log(decode(encode([new Date(now)]))[0].getTime() === now);
};

// Symbols
const symbolsTest = () => {
    const sharedAnonymousSymbol = Symbol();

    const decoded = decode(encode({
        'shared symbol 1': sharedAnonymousSymbol,
        'shared symbol 2': sharedAnonymousSymbol,
        'keyed symbol 1': Symbol.for('symbol1'),
        'keyed symbol 2': Symbol.for('symbol1'),
        'normal symbol': Symbol(),
    }));

    console.log(decoded['shared symbol 1'] === decoded['shared symbol 2']);
    console.log(decoded['keyed symbol 1'] === decoded['keyed symbol 2']);
    console.log(decoded['normal symbol'] !== decoded['shared symbol 1']);
    console.log(decoded['normal symbol'] !== decoded['keyed symbol 1']);
};

// Functions
const functionsTest = () => {
    const functionObj = {
        normalFunction: function() {
            return 1;
        },
        methodFunction() {
            return 2;
        },
        namedFunction: function test() {
            return Object.prototype.toString.call(test) === '[object Function]';
        },
        arrowFunction: () => {
            return 3;
        },
        arrowBareFunction: x => 4,
    };

    const decodedObj = decode(encode(functionObj));

    console.log(isFunction(decodedObj.normalFunction));
    console.log(decodedObj.normalFunction() === 1);
    console.log(decodedObj.methodFunction() === 2);
    console.log(decodedObj.namedFunction() === true);
    console.log(decodedObj.arrowFunction() === 3);
    console.log(decodedObj.arrowBareFunction() === 4);
};

// Objects
const objectsTest = () => {
    const now = Date.now();

    const valueStorage = {
        'un': void 0,
        'nl': null,
        'Bt': true,
        'Bf': false,
        'Na': NaN,
        '-I': -Infinity,
        '+I': Infinity,
        '-0': -0,
        'nm': 1,
        'st': 'string',
        're': /\s+/g,
        'da': new Date(now),
        'sy': Symbol(),
        'fu': () => { return 2; },
        'Fi': 'Fi',
        'Bl': 'Bl',
        'ob': {},
        'ar': [],
    };

    const decodedValueStorage = decode(encode(valueStorage));

    console.log(decodedValueStorage['un'] === void 0);
    console.log(decodedValueStorage['nl'] === null);
    console.log(decodedValueStorage['Bt'] === true);
    console.log(decodedValueStorage['Bf'] === false);
    console.log(isNanValue(decodedValueStorage['Na']));
    console.log(decodedValueStorage['-I'] === -Infinity);
    console.log(decodedValueStorage['+I'] === Infinity);
    console.log(isNegativeZero(decodedValueStorage['-0']));
    console.log(decodedValueStorage['nm'] === 1);
    console.log(decodedValueStorage['st'] === 'string');
    console.log(decodedValueStorage['re'].source === '\\s+');
    console.log(decodedValueStorage['re'].flags === 'g');
    console.log(decodedValueStorage['re'].lastIndex === 0);
    console.log(isFunction(decodedValueStorage['fu']) && decodedValueStorage['fu']() === 2);
    console.log(decodedValueStorage['da'].getTime() === now);
    console.log(isSymbol(decodedValueStorage['sy']));
    console.log(isObject(decodedValueStorage['ob']));
    console.log(isArray(decodedValueStorage['ar']));

    // String number key
    console.log(decode(encode({ ['0']: 1 }))['0'] === 1);

    // Empty string key
    console.log(decode(encode({ ['']: 2 }))[''] === 2);

    // Normal Symbol key
    const decodedNormalSymbolObj = decode(encode({ [Symbol()]: 3 }));
    const decodedNormalSymbolKeys = Object.keys(decodedNormalSymbolObj).concat(Object.getOwnPropertySymbols(decodedNormalSymbolObj));
    console.log(decodedNormalSymbolKeys.length === 1);
    console.log(isSymbol(decodedNormalSymbolKeys[0]));
    console.log(decodedNormalSymbolObj[decodedNormalSymbolKeys[0]] === 3);

    // Keyed Symbol key
    const decodedKeyedSymbolObj = decode(encode({ [Symbol.for('keyed')]: 4 }));
    const decodedKeyedSymbolKeys = Object.keys(decodedKeyedSymbolObj).concat(Object.getOwnPropertySymbols(decodedKeyedSymbolObj));
    console.log(decodedKeyedSymbolKeys.length === 1);
    console.log(isSymbol(decodedKeyedSymbolKeys[0]));
    console.log(Symbol.keyFor(decodedKeyedSymbolKeys[0]) === 'keyed');
    console.log(decodedKeyedSymbolObj[decodedKeyedSymbolKeys[0]] === 4);

    // Nested objects
    const nestedObj = decode(encode({
        a: {
            b: {
                c: {
                    d: {
                        e: 5,
                    },
                },
            },
        },
    }));
    console.log(nestedObj.a.b.c.d.e === 5);

    // Circular object references
    const circular = {
        x: {
            y: {
                z: void 0,
            },
        },
    };
    circular.x.y.z = circular;
    const decodedCircularObj = decode(encode(circular));
    console.log(decodedCircularObj === decodedCircularObj.x.y.z);
    console.log(decodedCircularObj === decodedCircularObj.x.y.z.x.y.z);
};

// Arrays
const arraysTest = () => {
    const now = Date.now();

    const valueStorage = [
        void 0,
        null,
        true,
        false,
        NaN,
        -Infinity,
        Infinity,
        -0,
        1,
        'string',
        /\s+/g,
        new Date(now),
        Symbol(),
        () => { return 3; },
        {},
        [],
    ];

    const decodedValueStorage = decode(encode(valueStorage));

    console.log(decodedValueStorage[0] === void 0);
    console.log(decodedValueStorage[1] === null);
    console.log(decodedValueStorage[2] === true);
    console.log(decodedValueStorage[3] === false);
    console.log(isNanValue(decodedValueStorage[4]));
    console.log(decodedValueStorage[5] === -Infinity);
    console.log(decodedValueStorage[6] === Infinity);
    console.log(isNegativeZero(decodedValueStorage[7]));
    console.log(decodedValueStorage[8] === 1);
    console.log(decodedValueStorage[9] === 'string');
    console.log(isRegex(decodedValueStorage[10]));
    console.log(decodedValueStorage[11].getTime() === now);
    console.log(isSymbol(decodedValueStorage[12]));
    console.log(isFunction(decodedValueStorage[13]) && decodedValueStorage[13]() === 3);
    console.log(isObject(decodedValueStorage[14]));
    console.log(Object.keys(decodedValueStorage[14]).concat(Object.getOwnPropertySymbols(decodedValueStorage[14])).length === 0);
    console.log(isArray(decodedValueStorage[15]));
    console.log(decodedValueStorage[15].length === 0);

    // Nested Array
    const nestedArray = decode(encode([
        [
            [
                [
                    1,
                ],
                2,
            ],
            3,
        ],
        4,
    ]));

    console.log(nestedArray[0][0][0][0] === 1);
    console.log(nestedArray[0][0][1] === 2);
    console.log(nestedArray[0][1] === 3);
    console.log(nestedArray[1] === 4);

    // Circular array references
    const circular = [
        [
            [
                [
                    1
                ],
                void 0,
            ],
        ],
    ];

    circular[0][0][1] = circular;

    const circularArray = decode(encode(circular));

    console.log(circularArray[0][0][0][0] === 1);
    console.log(circularArray[0][0][1][0][0][0][0] === 1);
    console.log(circularArray[0][0][1] === circularArray);
    console.log(circularArray[0][0][1] === circularArray[0][0][1][0][0][1]);

    // Sparse Array
    const sparse = [0];
    sparse[5] = 5;
    const sparseArray = decode(encode(sparse));
    console.log(sparse[0] === 0);
    console.log(sparse[5] === 5);
    console.log(sparse[3] === void 0);
    console.log(sparseArray.length === 6);
};

// Referencial equality
const referencialEqualityTest = () => {
    const sharedList = [
        /\s+/g,
        new Date(),
        Symbol(),
        () => { return 1; },
        {},
        [],
    ];

    sharedList.forEach((item) => {
        const decoded = decode(encode({
            x: item,
            y: item,
        }));

        // The same reference in the encoded data will result in the shared references in the decoded data
        console.log(decoded.x === decoded.y);

        // However, the act of serializing the source data at all means that the reference to the original reference will be lost
        console.log(decoded.x !== item);
    });
};

// Decoder can handle unknown PointerKeys
const unknownPointerKeyTest = () => {
    const innerData = {
        "root": "ar0",
        "ar": [
            [
                ["nm0", "--0"],
            ],
        ],
        "--": ["a"],
        "nm": [0],
    };
    console.log(decode(innerData)[0] === '--0');

    const valueData = {
        "root": "--0",
        "--": ["a"],
    };
    console.log(decode(valueData) === '--0');

    const objectKeyData = {
        "root": "ob0",
        "ob": [
            [
                ["--0","nm0"],
            ],
        ],
        "nm": [1],
        "--": ["a"],
    };
    const decodedObjectKeys = Object.keys(decode(objectKeyData));
    console.log(decodedObjectKeys.length === 1 && decodedObjectKeys[0] === '--0');
};

topLevelValueTest();
numbersTest();
stringsTest();
regexTest();
datesTest();
symbolsTest();
functionsTest();
objectsTest();
arraysTest();
referencialEqualityTest();
unknownPointerKeyTest();
