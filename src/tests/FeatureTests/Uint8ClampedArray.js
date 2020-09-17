import test from '/tests/tape.js';
import jsonComplete from '/main.js';
import StandardObjectTests from '/tests/StandardObjectTests.js';
import testHelpers from '/tests/testHelpers.js';

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof Uint8ClampedArray === 'function') {
    test('Uint8ClampedArray: Normal', (t) => {
        t.plan(3);

        const a = new Uint8ClampedArray(2);
        a[0] = 1;
        a[1] = 2;

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object Uint8ClampedArray]');
        t.equal(decoded[0], 1);
        t.equal(decoded[1], 2);
    });

    test('Uint8ClampedArray: Empty Cells', (t) => {
        t.plan(2);

        const a = new Uint8ClampedArray(2);
        a[0] = 1;

        const decoded = decode(encode([a]))[0];

        t.equal(decoded[0], 1);
        t.equal(decoded[1], 0);
    });

    test('Uint8ClampedArray: Empty', (t) => {
        t.plan(2);

        const a = new Uint8ClampedArray(0);

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object Uint8ClampedArray]');
        t.equal(decoded.length, 0);
    });

    test('Uint8ClampedArray: Root Value', (t) => {
        t.plan(1);
        t.deepEqual(decode(encode(new Uint8ClampedArray([1]))), new Uint8ClampedArray([1]));
    });

    StandardObjectTests('Uint8ClampedArray', 'Uint8ClampedArray', () => {
        return new Uint8ClampedArray(2);
    });

    test('Uint8ClampedArray: Encoding Expected', (t) => {
        t.plan(1);

        const source = new Uint8ClampedArray(1);
        source[0] = 1;
        source.a = false;

        t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
            UC: 'N0 S0 $3',
            N: '4',
            S: [
                'a',
            ],
            r: 'UC0',
        });
    });
}
else {
    console.log('Tests for Uint8ClampedArray type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
