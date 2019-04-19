const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof Uint16Array === 'function') {
    test('Uint16Array: Normal', (t) => {
        t.plan(3);

        const a = new Uint16Array(2);
        a[0] = 1;
        a[1] = 2;

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object Uint16Array]');
        t.equal(decoded[0], 1);
        t.equal(decoded[1], 2);
    });

    test('Uint16Array: Empty Cells', (t) => {
        t.plan(2);

        const a = new Uint16Array(2);
        a[0] = 1;

        const decoded = decode(encode([a]))[0];

        t.equal(decoded[0], 1);
        t.equal(decoded[1], 0);
    });

    test('Uint16Array: Empty', (t) => {
        t.plan(2);

        const a = new Uint16Array(0);

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object Uint16Array]');
        t.equal(decoded.length, 0);
    });

    test('Uint16Array: Root Value', (t) => {
        t.plan(1);
        t.deepEqual(decode(encode(new Uint16Array([1]))), new Uint16Array([1]));
    });

    StandardObjectTests('Uint16Array', 'Uint16Array', () => {
        return new Uint16Array(2);
    });

    test('Uint16Array: Encoding Expected', (t) => {
        t.plan(1);

        const source = new Uint16Array(1);
        source[0] = 1;
        source.a = false;

        t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
            US: 'N0 S0 $3',
            N: '4',
            S: [
                'a',
            ],
            r: 'US0',
        });
    });
}
else {
    console.log('Tests for Uint16Array type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
