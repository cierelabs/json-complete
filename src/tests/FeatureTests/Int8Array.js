const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof Int8Array === 'function') {
    test('Int8Array: Normal', (t) => {
        t.plan(3);

        const a = new Int8Array(2);
        a[0] = 1;
        a[1] = 2;

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object Int8Array]');
        t.equal(decoded[0], 1);
        t.equal(decoded[1], 2);
    });

    test('Int8Array: Empty Cells', (t) => {
        t.plan(4);

        const a = new Int8Array(2);
        a[0] = 1;

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object Int8Array]');
        t.equal(decoded.length, 2);
        t.equal(decoded[0], 1);
        t.equal(decoded[1], 0);
    });

    test('Int8Array: Empty', (t) => {
        t.plan(2);

        const a = new Int8Array(0);

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object Int8Array]');
        t.equal(decoded.length, 0);
    });

    test('Int8Array: Root Value', (t) => {
        t.plan(1);
        t.deepEqual(decode(encode(new Int8Array([1]))), new Int8Array([1]));
    });

    test('Int8Array: Arbitrary Attached Data', (t) => {
        t.plan(2);

        const a = new Int8Array(2);
        a.x = 2;
        a[Symbol.for('Int8Array')] = 'test';

        const decoded = decode(encode([a], {
            encodeSymbolKeys: true,
        }))[0];

        t.equal(decoded.x, 2);
        t.equal(decoded[Symbol.for('Int8Array')], 'test');
    });

    test('Int8Array: Self-Containment', (t) => {
        t.plan(1);

        const a = new Int8Array(2);
        a.me = a;

        const decoded = decode(encode([a]))[0];

        t.equal(decoded.me, decoded);
    });

    test('Int8Array: Referencial Integrity', (t) => {
        t.plan(2);

        const source = new Int8Array(1);

        const decoded = decode(encode({
            x: source,
            y: source,
        }));

        t.equal(decoded.x, decoded.y);
        t.notEqual(decoded.x, source);
    });

    test('Int8Array: Encoding Expected', (t) => {
        t.plan(1);

        const source = new Int8Array(1);
        source[0] = 1;
        source.a = false;

        t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
            I1: [
                [
                    [
                        'Nu0',
                    ],
                    [
                        'St0',
                    ],
                    [
                        'fa',
                    ],
                ],
            ],
            Nu: [
                '1',
            ],
            St: [
                'a',
            ],
            r: 'I10',
        });
    });
}
else {
    console.warn('Tests for Int8Array type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
