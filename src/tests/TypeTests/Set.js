const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof Set === 'function') {
    test('Set: Normal', (t) => {
        t.plan(4);

        const source = [1, 2, 'test', { a: { b: 2 } }];

        const decoded = decode(encode([new Set(source)]))[0];

        let i = 0;
        decoded.forEach((v) => {
            if (!testHelpers.isObject(v)) {
                t.equal(source[i], v);
            }
            else {
                t.equal(source[i].a.b, v.a.b);
            }
            i += 1;
        });
    });

    test('Set: Root Value', (t) => {
        t.plan(4);

        const source = [1, 2, 'test', { a: { b: 2 } }];

        const decoded = decode(encode(new Set(source)));

        let i = 0;
        decoded.forEach((v) => {
            if (!testHelpers.isObject(v)) {
                t.equal(source[i], v);
            }
            else {
                t.equal(source[i].a.b, v.a.b);
            }
            i += 1;
        });
    });

    test('Set: void 0', (t) => {
        t.plan(1);
        const decoded = decode(encode([new Set([void 0])]))[0];
        let value;
        decoded.forEach((v) => {
            value = v;
        });
        t.equal(value, void 0);
    });

    test('Set: -0 (Sets do not store -0, only 0: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#Value_equality )', (t) => {
        t.plan(2);
        const decoded = decode(encode([new Set([-0])]))[0];
        let value;
        decoded.forEach((v) => {
            value = v;
        });
        t.notOk(testHelpers.isNegativeZero(value));
        t.equal(value, 0);
    });

    test('Set: Object Inside', (t) => {
        t.plan(2);

        const decoded = decode(encode([new Set([{}])]))[0];
        let value;
        decoded.forEach((v) => {
            value = v;
        });

        t.ok(testHelpers.isObject(value));
        t.equal(Object.keys(value).concat(Object.getOwnPropertySymbols(value)).length, 0);
    });

    test('Set: Referencial Integrity Within and Without', (t) => {
        t.plan(2);

        const obj = {
            a: {
                b: 2,
            },
        };

        const set = new Set([obj]);
        set.obj = obj;

        const decoded = decode(encode([set]))[0];
        let value;
        decoded.forEach((v) => {
            value = v;
        });

        t.equal(value.a.b, decoded.obj.a.b);
        t.equal(value, decoded.obj);
    });

    test('Set: Arbitrary Attached Data', (t) => {
        t.plan(3);
        const set = new Set([1]);
        set.x = 2;
        set[Symbol.for('set')] = 'test';

        const decodedSet = decode(encode([set]))[0];

        t.ok(decodedSet.has(1));
        t.equal(decodedSet.x, 2);
        t.equal(decodedSet[Symbol.for('set')], 'test');
    });

    test('Set: Self-Containment', (t) => {
        t.plan(2);
        const set = new Set([1]);
        set.me = set;

        const decodedSet = decode(encode([set]))[0];

        t.ok(decodedSet.has(1));
        t.equal(decodedSet.me, decodedSet);
    });

    test('Set: Referencial Integrity', (t) => {
        t.plan(2);

        const source = new Set([1]);

        const decoded = decode(encode({
            x: source,
            y: source,
        }));

        t.equal(decoded.x, decoded.y);
        t.notEqual(decoded.x, source);
    });
}
