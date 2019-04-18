const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof Int16Array === 'function') {
    test('Int16Array: Normal', (t) => {
        t.plan(3);

        const a = new Int16Array(2);
        a[0] = 1;
        a[1] = 2;

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object Int16Array]');
        t.equal(decoded[0], 1);
        t.equal(decoded[1], 2);
    });

    test('Int16Array: Empty Cells', (t) => {
        t.plan(2);

        const a = new Int16Array(2);
        a[0] = 1;

        const decoded = decode(encode([a]))[0];

        t.equal(decoded[0], 1);
        t.equal(decoded[1], 0);
    });

    test('Int16Array: Empty', (t) => {
        t.plan(2);

        const a = new Int16Array(0);

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object Int16Array]');
        t.equal(decoded.length, 0);
    });

    test('Int16Array: Root Value', (t) => {
        t.plan(1);
        t.deepEqual(decode(encode(new Int16Array([1]))), new Int16Array([1]));
    });

    StandardObjectTests('Int16Array', 'Int16Array', () => {
        return new Int16Array(2);
    });

    test('Int16Array: Encoding Expected', (t) => {
        t.plan(1);

        const source = new Int16Array(1);
        source[0] = 1;
        source.a = false;

        t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
            IS: 'N0 S0 $3',
            N: '1',
            S: [
                'a',
            ],
            r: 'IS0',
        });
    });
}
else {
    console.log('Tests for Int16Array type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
