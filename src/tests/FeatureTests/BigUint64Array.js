import test from '/tests/tape.js';
import jsonComplete from '/main.js';
import StandardObjectTests from '/tests/StandardObjectTests.js';
import testHelpers from '/tests/testHelpers.js';

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof BigUint64Array === 'function') {
    test('BigUint64Array: Normal', (t) => {
        t.plan(3);

        const a = new BigUint64Array(2);
        a[0] = BigInt(1);
        a[1] = BigInt(2);

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object BigUint64Array]');
        t.equal(decoded[0], BigInt(1));
        t.equal(decoded[1], BigInt(2));
    });

    test('BigUint64Array: Empty Cells', (t) => {
        t.plan(2);

        const a = new BigUint64Array(2);
        a[0] = BigInt(1);

        const decoded = decode(encode([a]))[0];

        t.equal(decoded[0], BigInt(1));
        t.equal(decoded[1], BigInt(0));
    });

    test('BigUint64Array: Empty', (t) => {
        t.plan(2);

        const a = new BigUint64Array(0);

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object BigUint64Array]');
        t.equal(decoded.length, 0);
    });

    test('BigUint64Array: Root Value', (t) => {
        t.plan(1);
        t.deepEqual(decode(encode(new BigUint64Array([BigInt(1)]))), new BigUint64Array([BigInt(1)]));
    });

    StandardObjectTests('BigUint64Array', 'BigUint64Array', () => {
        return new BigUint64Array(2);
    });

    test('BigUint64Array: Encoding Expected', (t) => {
        t.plan(1);

        const source = new BigUint64Array(1);
        source[0] = BigInt(1);
        source.a = false;

        t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
            BU: 'I0 S0 $3',
            I: '4',
            S: [
                'a',
            ],
            r: 'BU0',
        });
    });
}
else {
    console.log('Tests for BigUint64Array type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
