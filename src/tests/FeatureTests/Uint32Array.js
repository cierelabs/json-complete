const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof Uint32Array === 'function') {
    test('Uint32Array: Normal', (t) => {
        t.plan(3);

        const a = new Uint32Array(2);
        a[0] = 1;
        a[1] = 2;

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object Uint32Array]');
        t.equal(decoded[0], 1);
        t.equal(decoded[1], 2);
    });

    test('Uint32Array: Empty Cells', (t) => {
        t.plan(2);

        const a = new Uint32Array(2);
        a[0] = 1;

        const decoded = decode(encode([a]))[0];

        t.equal(decoded[0], 1);
        t.equal(decoded[1], 0);
    });

    test('Uint32Array: Empty', (t) => {
        t.plan(2);

        const a = new Uint32Array(0);

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object Uint32Array]');
        t.equal(decoded.length, 0);
    });

    test('Uint32Array: Root Value', (t) => {
        t.plan(1);
        t.deepEqual(decode(encode(new Uint32Array([1]))), new Uint32Array([1]));
    });

    test('Uint32Array: Arbitrary Attached Data', (t) => {
        t.plan(2);

        const a = new Uint32Array(2);
        a.x = 2;
        a[Symbol.for('Uint32Array')] = 'test';

        const decoded = decode(encode([a], {
            encodeSymbolKeys: true,
        }))[0];

        t.equal(decoded.x, 2);
        t.equal(decoded[Symbol.for('Uint32Array')], 'test');
    });

    test('Uint32Array: Self-Containment', (t) => {
        t.plan(1);

        const a = new Uint32Array(2);
        a.me = a;

        const decoded = decode(encode([a]))[0];

        t.equal(decoded.me, decoded);
    });

    test('Uint32Array: Referencial Integrity', (t) => {
        t.plan(2);

        const source = new Uint32Array(1);

        const decoded = decode(encode({
            x: source,
            y: source,
        }));

        t.equal(decoded.x, decoded.y);
        t.notEqual(decoded.x, source);
    });

    test('Uint32Array: Encoding Expected', (t) => {
        t.plan(1);

        const source = new Uint32Array(1);
        source[0] = 1;
        source.a = false;

        t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
            U3: [
                [
                    [
                        'Nu0',
                    ],
                    [
                        'St0',
                        'fa'
                    ],
                ],
            ],
            Nu: [
                'St1',
            ],
            St: [
                'a',
                '1',
            ],
            r: 'U30',
        });
    });
}
else {
    console.warn('Tests for Uint32Array type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
