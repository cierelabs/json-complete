const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof Map === 'function') {
    test('Map: Normal', (t) => {
        t.plan(8);

        const originalData = [1, 2, 'test', { a: { b: 2 } }];

        const source = new Map();
        source.set(originalData[0], originalData[0]);
        source.set(originalData[1], originalData[1]);
        source.set(originalData[2], originalData[2]);
        source.set(originalData[3], originalData[3]);

        const decoded = decode(encode([source]))[0];

        let i = 0;
        decoded.forEach((v, k) => {
            if (!testHelpers.isObject(v)) {
                t.equal(originalData[i], k);
                t.equal(originalData[i], v);
            }
            else {
                t.equal(originalData[i].a.b, k.a.b);
                t.equal(originalData[i].a.b, v.a.b);
            }
            i += 1;
        });
    });

    test('Map: Root Value', (t) => {
        t.plan(8);

        const originalData = [1, 2, 'test', { a: { b: 2 } }];

        const source = new Map();
        source.set(originalData[0], originalData[0]);
        source.set(originalData[1], originalData[1]);
        source.set(originalData[2], originalData[2]);
        source.set(originalData[3], originalData[3]);

        const decoded = decode(encode(source));

        let i = 0;
        decoded.forEach((v, k) => {
            if (!testHelpers.isObject(v)) {
                t.equal(originalData[i], k);
                t.equal(originalData[i], v);
            }
            else {
                t.equal(originalData[i].a.b, k.a.b);
                t.equal(originalData[i].a.b, v.a.b);
            }
            i += 1;
        });
    });

    test('Map (Value): void 0', (t) => {
        t.plan(1);

        const source = new Map();
        source.set(0, void 0);

        const decoded = decode(encode([source]))[0];
        let value;
        decoded.forEach((v) => {
            value = v;
        });
        t.equal(value, void 0);
    });

    test('Map (Value): -0', (t) => {
        t.plan(1);

        const source = new Map();
        source.set(0, -0);

        const decoded = decode(encode([source]))[0];
        let value;
        decoded.forEach((v) => {
            value = v;
        });
        t.ok(testHelpers.isNegativeZero(value));
    });

    test('Map (Value): Object Inside', (t) => {
        t.plan(2);

        const source = new Map();
        source.set(0, {});

        const decoded = decode(encode([source]))[0];
        let value;
        decoded.forEach((v) => {
            value = v;
        });

        t.ok(testHelpers.isObject(value));

        let keys = Object.keys(value);
        if (typeof Symbol === 'function') {
            keys = keys.concat(Object.getOwnPropertySymbols(value));
        }
        t.equal(keys.length, 0);
    });

    test('Map (Value): Referential Integrity Within and Without', (t) => {
        t.plan(2);

        const obj = {
            a: {
                b: 2,
            },
        };

        const source = new Map();
        source.set(0, obj);

        const map = source;
        map.obj = obj;

        const decoded = decode(encode([map]))[0];
        let value;
        decoded.forEach((v) => {
            value = v;
        });

        t.equal(value.a.b, decoded.obj.a.b);
        t.equal(value, decoded.obj);
    });

    test('Map (Key): void 0', (t) => {
        t.plan(1);

        const source = new Map();
        source.set(void 0, 1);

        const decoded = decode(encode([source]))[0];
        let key;
        decoded.forEach((v, k) => {
            key = k;
        });
        t.equal(key, void 0);
    });

    test('Map (Key): -0 (Maps cannot use -0 as a key, only 0: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Key_equality )', (t) => {
        t.plan(2);
        const decoded = decode(encode([new Map([[-0, 1]])]))[0];
        let key;
        decoded.forEach((v, k) => {
            key = k;
        });
        t.notOk(testHelpers.isNegativeZero(key));
        t.equal(key, 0);
    });

    test('Map (Key): Object Inside', (t) => {
        t.plan(2);

        const source = new Map();
        source.set({}, 1);

        const decoded = decode(encode([source]))[0];
        let key;
        decoded.forEach((v, k) => {
            key = k;
        });

        t.ok(testHelpers.isObject(key));

        let keys = Object.keys(key);
        if (typeof Symbol === 'function') {
            keys = keys.concat(Object.getOwnPropertySymbols(key));
        }
        t.equal(keys.length, 0);
    });

    test('Map (Key): Referential Integrity Within and Without', (t) => {
        t.plan(2);

        const obj = {
            a: {
                b: 2,
            },
        };

        const source = new Map();
        source.set(obj, 1);

        const map = source;
        map.obj = obj;

        const decoded = decode(encode([map]))[0];
        let key;
        decoded.forEach((v, k) => {
            key = k;
        });

        t.equal(key.a.b, decoded.obj.a.b);
        t.equal(key, decoded.obj);
    });

    test('Map: Referential Integrity Between Key and Value', (t) => {
        t.plan(3);

        const obj = { a: { b: 2 } };

        const source = new Map();
        source.set(obj, obj);

        const decoded = decode(encode([source]))[0];

        decoded.forEach((v, k) => {
            t.equal(k, v);
            t.notEqual(obj, k);
            t.notEqual(obj, v);
        });
    });

    const detectedMapSystemName = testHelpers.systemName(new Map()) === '[object Map]' ? 'Map' : 'Object';

    StandardObjectTests('Map', detectedMapSystemName, () => {
        const source = new Map();
        source.set(2, 1);
        return source;
    });

    test('Map: Encoding Expected', (t) => {
        t.plan(1);

        const source = new Map([[false, true]]);
        source.b = false;

        t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
            Ma: [
                [
                    [
                        'fa',
                    ],
                    [
                        'tr',
                    ],
                    [
                        'St0',
                    ],
                    [
                        'fa',
                    ],
                ],
            ],
            St: [
                'b',
            ],
            r: 'Ma0',
        });
    });
}
else {
    console.warn('Tests for Map type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
