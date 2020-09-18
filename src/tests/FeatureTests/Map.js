import test from '/tests/tape.js';
import jsonComplete from '/main.js';
import StandardObjectTests from '/tests/StandardObjectTests.js';
import testHelpers from '/tests/testHelpers.js';

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
        const value = testHelpers.getOnlyValueFromCollection(decoded);

        t.equal(value, void 0);
    });

    test('Map (Value): -0', (t) => {
        t.plan(1);

        const source = new Map();
        source.set(0, -0);

        const decoded = decode(encode([source]))[0];
        const value = testHelpers.getOnlyValueFromCollection(decoded);

        t.ok(testHelpers.isNegativeZero(value));
    });

    test('Map (Value): Object Inside', (t) => {
        t.plan(2);

        const source = new Map();
        source.set(0, {});

        const decoded = decode(encode([source]))[0];
        const value = testHelpers.getOnlyValueFromCollection(decoded);

        t.ok(testHelpers.isObject(value));
        t.equal(testHelpers.getAllKeys(value).length, 0);
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
        const value = testHelpers.getOnlyValueFromCollection(decoded);

        t.equal(value.a.b, decoded.obj.a.b);
        t.equal(value, decoded.obj);
    });

    test('Map (Key): void 0', (t) => {
        t.plan(1);

        const source = new Map();
        source.set(void 0, 1);

        const decoded = decode(encode([source]))[0];
        const key = testHelpers.getOnlyKeyFromCollection(decoded);

        t.equal(key, void 0);
    });

    // Early implementations of Map allowed for key non-equality between 0 and -0
    if (!testHelpers.mapSupportsDistinctNegativeZeroKeys()) {
        test('Map (Key): -0 (Maps cannot use -0 as a key, only 0: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Key_equality )', (t) => {
            t.plan(2);

            const source = new Map();
            source.set(-0, 1);

            const decoded = decode(encode([source]))[0];
            const key = testHelpers.getOnlyKeyFromCollection(decoded);

            t.notOk(testHelpers.isNegativeZero(key));
            t.equal(key, 0);
        });
    }

    test('Map (Key): Object Inside', (t) => {
        t.plan(2);

        const source = new Map();
        source.set({}, 1);

        const decoded = decode(encode([source]))[0];
        const key = testHelpers.getOnlyKeyFromCollection(decoded);

        t.ok(testHelpers.isObject(key));
        t.equal(testHelpers.getAllKeys(key).length, 0);
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
        const key = testHelpers.getOnlyKeyFromCollection(decoded);

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

        const source = new Map();
        source.set(false, true);

        source.b = false;

        t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
            V: '$3 $2 S0 $3',
            S: [
                'b',
            ],
            r: 'V0',
        });
    });
}
else {
    console.log('Tests for Map type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
