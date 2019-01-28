const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof Float32Array === 'function') {
    test('Float32Array: Normal', (t) => {
        t.plan(3);

        const a = new Float32Array(2);
        a[0] = 1.2;
        a[1] = 2.7;

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object Float32Array]');
        t.ok(Math.abs(decoded[0] - 1.2) < 0.00001);
        t.ok(Math.abs(decoded[1] - 2.7) < 0.00001);
    });

    test('Float32Array: Empty Cells', (t) => {
        t.plan(2);

        const a = new Float32Array(2);
        a[0] = 1.2;

        const decoded = decode(encode([a]))[0];

        t.ok(Math.abs(decoded[0] - 1.2) < 0.00001);
        t.equal(decoded[1], 0);
    });

    test('Float32Array: Empty', (t) => {
        t.plan(2);

        const a = new Float32Array(0);

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object Float32Array]');
        t.equal(decoded.length, 0);
    });

    test('Float32Array: Root Value', (t) => {
        t.plan(1);
        t.deepEqual(decode(encode(new Float32Array([1]))), new Float32Array([1]));
    });

    StandardObjectTests('Float32Array', 'Float32Array', () => {
        return new Float32Array(2);
    });

    test('Float32Array: Encoding Expected', (t) => {
        t.plan(1);

        const source = new Float32Array(1);
        source[0] = 1;
        source.a = false;

        t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
            FT: [
                [
                    [
                        'N0',
                    ],
                    [
                        'S0',
                    ],
                    [
                        'F',
                    ],
                ],
            ],
            N: [
                '1',
            ],
            S: [
                'a',
            ],
            r: 'FT0',
        });
    });
}
else {
    console.warn('Tests for Float32Array type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
