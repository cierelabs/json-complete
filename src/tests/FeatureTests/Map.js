const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof Map === 'function') {
    test('Map: Normal', (t) => {
        t.plan(8);

        const source = [[1, 1], [2, 2], ['test', 'test'], [{ a: { b: 2 } }, { a: { b: 2 } }]];

        const decoded = decode(encode([new Map(source)]))[0];

        let i = 0;
        decoded.forEach((v, k) => {
            if (!testHelpers.isObject(v)) {
                t.equal(source[i][0], k);
                t.equal(source[i][1], v);
            }
            else {
                t.equal(source[i][0].a.b, k.a.b);
                t.equal(source[i][1].a.b, v.a.b);
            }
            i += 1;
        });
    });

    test('Map: Root Value', (t) => {
        t.plan(8);

        const source = [[1, 1], [2, 2], ['test', 'test'], [{ a: { b: 2 } }, { a: { b: 2 } }]];

        const decoded = decode(encode(new Map(source)));

        let i = 0;
        decoded.forEach((v, k) => {
            if (!testHelpers.isObject(v)) {
                t.equal(source[i][0], k);
                t.equal(source[i][1], v);
            }
            else {
                t.equal(source[i][0].a.b, k.a.b);
                t.equal(source[i][1].a.b, v.a.b);
            }
            i += 1;
        });
    });

    test('Map (Value): void 0', (t) => {
        t.plan(1);
        const decoded = decode(encode([new Map([[0, void 0]])]))[0];
        let value;
        decoded.forEach((v) => {
            value = v;
        });
        t.equal(value, void 0);
    });

    test('Map (Value): -0', (t) => {
        t.plan(1);
        const decoded = decode(encode([new Map([[0, -0]])]))[0];
        let value;
        decoded.forEach((v) => {
            value = v;
        });
        t.ok(testHelpers.isNegativeZero(value));
    });

    test('Map (Value): Object Inside', (t) => {
        t.plan(2);

        const decoded = decode(encode([new Map([[0, {}]])]))[0];
        let value;
        decoded.forEach((v) => {
            value = v;
        });

        t.ok(testHelpers.isObject(value));
        t.equal(Object.keys(value).concat(Object.getOwnPropertySymbols(value)).length, 0);
    });

    test('Map (Value): Referential Integrity Within and Without', (t) => {
        t.plan(2);

        const obj = {
            a: {
                b: 2,
            },
        };

        const map = new Map([[0, obj]]);
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
        const decoded = decode(encode([new Map([[void 0, 1]])]))[0];
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

        const decoded = decode(encode([new Map([[{}, 1]])]))[0];
        let key;
        decoded.forEach((v, k) => {
            key = k;
        });

        t.ok(testHelpers.isObject(key));
        t.equal(Object.keys(key).concat(Object.getOwnPropertySymbols(key)).length, 0);
    });

    test('Map (Key): Referential Integrity Within and Without', (t) => {
        t.plan(2);

        const obj = {
            a: {
                b: 2,
            },
        };

        const map = new Map([[obj, 1]]);
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
        const source = [[obj, obj]];

        const decoded = decode(encode([new Map(source)]))[0];

        decoded.forEach((v, k) => {
            t.equal(k, v);
            t.notEqual(obj, k);
            t.notEqual(obj, v);
        });
    });

    StandardObjectTests('Map', 'Map', () => {
        return new Map([[2, 1]]);
    });

    test('Map: Encoding Expected', (t) => {
        t.plan(1);

        const source = new Map([[false, true]]);
        source.b = false;

        t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
            V: 'F0 T0 S0 F0',
            S: [
                'b',
            ],
            r: 'V0',
        });
    });
}
else {
    console.warn('Tests for Map type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
