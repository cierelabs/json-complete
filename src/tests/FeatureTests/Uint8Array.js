const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof Uint8Array === 'function') {
    test('Uint8Array: Normal', (t) => {
        t.plan(3);

        const a = new Uint8Array(2);
        a[0] = 1;
        a[1] = 2;

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object Uint8Array]');
        t.equal(decoded[0], 1);
        t.equal(decoded[1], 2);
    });

    test('Uint8Array: Empty Cells', (t) => {
        t.plan(2);

        const a = new Uint8Array(2);
        a[0] = 1;

        const decoded = decode(encode([a]))[0];

        t.equal(decoded[0], 1);
        t.equal(decoded[1], 0);
    });

    test('Uint8Array: Empty', (t) => {
        t.plan(2);

        const a = new Uint8Array(0);

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object Uint8Array]');
        t.equal(decoded.length, 0);
    });

    test('Uint8Array: Root Value', (t) => {
        t.plan(1);
        t.deepEqual(decode(encode(new Uint8Array([1]))), new Uint8Array([1]));
    });

    test('Uint8Array: Arbitrary Attached Data', (t) => {
        t.plan(2);

        const a = new Uint8Array(2);
        a.x = 2;
        a[Symbol.for('Uint8Array')] = 'test';

        const decoded = decode(encode([a], {
            encodeSymbolKeys: true,
        }))[0];

        t.equal(decoded.x, 2);
        t.equal(decoded[Symbol.for('Uint8Array')], 'test');
    });

    test('Uint8Array: Self-Containment', (t) => {
        t.plan(1);

        const a = new Uint8Array(2);
        a.me = a;

        const decoded = decode(encode([a]))[0];

        t.equal(decoded.me, decoded);
    });

    test('Uint8Array: Referencial Integrity', (t) => {
        t.plan(2);

        const source = new Uint8Array(1);

        const decoded = decode(encode({
            x: source,
            y: source,
        }));

        t.equal(decoded.x, decoded.y);
        t.notEqual(decoded.x, source);
    });

    test('Uint8Array: Encoding Expected', (t) => {
        t.plan(1);

        const source = new Uint8Array(1);
        source[0] = 1;
        source.a = false;

        t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
            U1: [
                [
                    [
                        'nm0',
                    ],
                    [
                        'st0',
                        'bf'
                    ],
                ],
            ],
            nm: [
                'st1',
            ],
            st: [
                'a',
                '1',
            ],
            r: 'U10',
        });
    });
}
else {
    console.warn('Tests for Uint8Array type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
