const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Array: Normal', (t) => {
    t.plan(1);
    t.deepEqual(decode(encode({ a: [1, 2, 1] })).a, [1, 2, 1]);
});

test('Array: Empty', (t) => {
    t.plan(2);
    const decoded = decode(encode({ a: [] })).a;
    t.deepEqual(decoded, []);
    t.deepEqual(decoded.length, 0);
});

test('Array: Root Value Normal', (t) => {
    t.plan(1);
    t.deepEqual(decode(encode([1])), [1]);
});

test('Array: Store Undefined', (t) => {
    t.plan(1);
    t.equal(decode(encode([void 0]))[0], void 0);
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

    const decodedArray = decode(encode(circular));

    t.equal(decodedArray[0][0][0][0], 1);
    t.equal(decodedArray[0][0][1][0][0][0][0], 1);
    t.equal(decodedArray[0][0][1], decodedArray);
    t.equal(decodedArray[0][0][1], decodedArray[0][0][1][0][0][1]);
});

test('Array: Sparse Array', (t) => {
    t.plan(4);

    const sparse = [0];
    sparse[5] = 5;
    const decodedArray = decode(encode(sparse));

    t.equal(decodedArray[0], 0);
    t.equal(decodedArray[5], 5);
    t.equal(decodedArray[3], void 0);
    t.equal(decodedArray.length, 6);
});

test('Array: Non-Index Keys', (t) => {
    t.plan(5);

    const sharedObj = {
        a: 1,
    };
    const arr = [
        1,
        sharedObj,
    ];
    arr['x'] = 5;
    arr['obj'] = sharedObj;

    const decodedArray = decode(encode(arr, {
        encodeSymbolKeys: true,
    }));

    t.ok(testHelpers.isArray(decodedArray));
    t.equal(decodedArray[0], 1);
    t.equal(decodedArray['x'], 5);
    t.deepEqual(decodedArray[1], sharedObj);
    t.equal(decodedArray[1], decodedArray['obj']);
});

test('Array: Direct Self-Containment', (t) => {
    t.plan(4);

    const arr = [1, void 0];
    arr[1] = arr;

    const decoded = decode(encode([arr]))[0];

    t.equal(testHelpers.systemName(decoded), '[object Array]');
    t.equal(decoded[0], 1);
    t.equal(testHelpers.systemName(decoded[1]), '[object Array]');
    t.equal(decoded[1], decoded);
});

StandardObjectTests('Array', 'Array', () => {
    return [];
});

test('Array: Encoding Expected', (t) => {
    t.plan(1);

    const arr = [true];
    arr.a = false;

    t.deepEqual(testHelpers.simplifyEncoded(encode(arr)), {
        Ar: [
            [
                [
                    'tr',
                ],
                [
                    'St0',
                ],
                [
                    'fa',
                ]
            ],
        ],
        St: [
            'a',
        ],
        r: 'Ar0',
    });
});
