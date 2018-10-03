const test = require('tape');
const jsonComplete = require('../main.js');
const testHelpers = require('../../_tools/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Array: void 0', (t) => {
    t.plan(1);
    t.equal(decode(encode([void 0]))[0], void 0);
});

test('Array: null', (t) => {
    t.plan(1);
    t.equal(decode(encode([null]))[0], null);
});

test('Array: true', (t) => {
    t.plan(1);
    t.equal(decode(encode([true]))[0], true);
});

test('Array: false', (t) => {
    t.plan(1);
    t.equal(decode(encode([false]))[0], false);
});

test('Array: NaN', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNanValue(decode(encode([NaN]))[0]));
});

test('Array: -Infinity', (t) => {
    t.plan(1);
    t.equal(decode(encode([-Infinity]))[0], -Infinity);
});

test('Array: Infinity', (t) => {
    t.plan(1);
    t.equal(decode(encode([Infinity]))[0], Infinity);
});

test('Array: -0', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNegativeZero(decode(encode([-0]))[0]));
});

test('Array: Number', (t) => {
    t.plan(1);
    t.equal(decode(encode([1]))[0], 1);
});

test('Array: String', (t) => {
    t.plan(1);
    t.equal(decode(encode(['string']))[0], 'string');
});

test('Array: Regex', (t) => {
    t.plan(1);
    t.ok(testHelpers.isRegex(decode(encode([/\s+/g]))[0]));
});

test('Array: Date', (t) => {
    t.plan(1);
    const now = Date.now();
    t.equal(decode(encode([new Date(now)]))[0].getTime(), now);
});

test('Array: Symbol', (t) => {
    t.plan(1);
    t.ok(testHelpers.isSymbol(decode(encode([Symbol()]))[0]));
});

test('Array: Function', (t) => {
    t.plan(1);
    t.ok(testHelpers.isFunction(decode(encode([() => { return 2; }]))[0]));
});

test('Array: Object Inside', (t) => {
    t.plan(2);

    const value = decode(encode([{}]))[0];

    t.ok(testHelpers.isObject(value));
    t.equal(Object.keys(value).concat(Object.getOwnPropertySymbols(value)).length, 0);
});

test('Array: Array Inside', (t) => {
    t.plan(2);

    const value = decode(encode([[]]))[0];

    t.ok(testHelpers.isArray(value));
    t.equal(value.length, 0);
});

test('Array: Nested Array', (t) => {
    t.plan(4);

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

    t.equal(nestedArray[0][0][0][0], 1);
    t.equal(nestedArray[0][0][1], 2);
    t.equal(nestedArray[0][1], 3);
    t.equal(nestedArray[1], 4);
});

test('Array: Circular Array References', (t) => {
    t.plan(4);

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

    t.equal(circularArray[0][0][0][0], 1);
    t.equal(circularArray[0][0][1][0][0][0][0], 1);
    t.equal(circularArray[0][0][1], circularArray);
    t.equal(circularArray[0][0][1], circularArray[0][0][1][0][0][1]);
});

test('Array: Sparse Array', (t) => {
    t.plan(4);

    const sparse = [0];
    sparse[5] = 5;
    const sparseArray = decode(encode(sparse));

    t.equal(sparse[0], 0);
    t.equal(sparse[5], 5);
    t.equal(sparse[3], void 0);
    t.equal(sparseArray.length, 6);
});

test('Array: Non-Index Keys', (t) => {
    t.plan(6);

    const sharedObj = {
        a: 1,
    };
    const arr = [
        1,
        sharedObj,
    ];
    arr['x'] = 5;
    arr['obj'] = sharedObj;
    arr[Symbol()] = 6;

    const decodedArray = decode(encode(arr));

    t.equal(decodedArray[0], 1);
    t.equal(decodedArray['x'], 5);
    t.deepEqual(decodedArray[1], sharedObj);
    t.equal(Object.getOwnPropertySymbols(decodedArray).length, 1);
    t.equal(decodedArray[Object.getOwnPropertySymbols(decodedArray)[0]], 6);
    t.equal(decodedArray[1], decodedArray['obj']);
});
