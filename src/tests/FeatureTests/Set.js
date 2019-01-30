const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof Set === 'function') {
    test('Set: Normal', (t) => {
        t.plan(4);

        const originalData = [1, 2, 'test', { a: { b: 2 } }];

        const source = new Set();
        source.add(originalData[0]);
        source.add(originalData[1]);
        source.add(originalData[2]);
        source.add(originalData[3]);

        const decoded = decode(encode([source]))[0];

        let i = 0;
        decoded.forEach((v) => {
            if (!testHelpers.isObject(v)) {
                t.equal(originalData[i], v);
            }
            else {
                t.equal(originalData[i].a.b, v.a.b);
            }
            i += 1;
        });
    });

    test('Set: Root Value', (t) => {
        t.plan(4);

        const originalData = [1, 2, 'test', { a: { b: 2 } }];

        const source = new Set();
        source.add(originalData[0]);
        source.add(originalData[1]);
        source.add(originalData[2]);
        source.add(originalData[3]);

        const decoded = decode(encode(source));

        let i = 0;
        decoded.forEach((v) => {
            if (!testHelpers.isObject(v)) {
                t.equal(originalData[i], v);
            }
            else {
                t.equal(originalData[i].a.b, v.a.b);
            }
            i += 1;
        });
    });

    test('Set: void 0', (t) => {
        t.plan(1);

        const source = new Set();
        source.add(void 0);

        const decoded = decode(encode([source]))[0];
        const value = testHelpers.getOnlyValueFromCollection(decoded);

        t.equal(value, void 0);
    });

    // Early implementations of Set allowed for value non-equality between 0 and -0
    if (!testHelpers.setSupportsDistinctNegativeZero()) {
        test('Set: -0 (Sets do not store -0, only 0: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#Value_equality )', (t) => {
            t.plan(2);

            const source = new Set();
            source.add(-0);

            const decoded = decode(encode([source]))[0];
            const value = testHelpers.getOnlyValueFromCollection(decoded);

            t.notOk(testHelpers.isNegativeZero(value));
            t.equal(value, 0);
        });
    }

    test('Set: Object Inside', (t) => {
        t.plan(2);

        const source = new Set();
        source.add({});

        const decoded = decode(encode([source]))[0];
        const value = testHelpers.getOnlyValueFromCollection(decoded);

        t.ok(testHelpers.isObject(value));
        t.equal(testHelpers.getAllKeys(value).length, 0);
    });

    test('Set: Referential Integrity Within and Without', (t) => {
        t.plan(2);

        const obj = {
            a: {
                b: 2,
            },
        };

        const source = new Set();
        source.add(obj);
        source.obj = obj;

        const decoded = decode(encode([source]))[0];
        const value = testHelpers.getOnlyValueFromCollection(decoded);

        t.equal(value.a.b, decoded.obj.a.b);
        t.equal(value, decoded.obj);
    });

    const detectedMapSystemName = testHelpers.systemName(new Set()) === '[object Set]' ? 'Set' : 'Object';

    StandardObjectTests('Set', detectedMapSystemName, () => {
        const source = new Set();
        source.add(3);
        return source;
    });

    test('Set: Encoding Expected', (t) => {
        t.plan(1);

        const source = new Set();
        source.add(true);
        source.b = false;

        t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
            U: 'T0 S0 F0',
            S: [
                'b',
            ],
            r: 'U0',
        });
    });
}
else {
    console.warn('Tests for Set type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
