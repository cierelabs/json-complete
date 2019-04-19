const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof ArrayBuffer === 'function') {
    test('ArrayBuffer: Normal', (t) => {
        t.plan(3);

        const a = new Uint8Array([1, 2]).buffer;

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object ArrayBuffer]');
        t.equal(decoded.byteLength, 2);
        t.deepEqual(new Uint8Array(decoded), [1, 2]);
    });

    test('ArrayBuffer: Empty Cells', (t) => {
        t.plan(4);

        const a = new Uint8Array(2);
        a[0] = 1;

        const decoded = decode(encode([a.buffer]))[0];

        t.equal(testHelpers.systemName(decoded), '[object ArrayBuffer]');
        t.equal(decoded.byteLength, 2);
        t.equal(new Uint8Array(decoded)[0], 1);
        t.equal(new Uint8Array(decoded)[1], 0);
    });

    test('ArrayBuffer: Empty', (t) => {
        t.plan(2);

        const a = new Uint8Array(0).buffer;

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object ArrayBuffer]');
        t.equal(decoded.byteLength, 0);
    });

    test('ArrayBuffer: Root Value', (t) => {
        t.plan(1);

        const a = new Uint8Array([1]).buffer;

        t.deepEqual(new Uint8Array(decode(encode(a))), new Uint8Array([1]));
    });

    test('ArrayBuffer: Index Key', (t) => {
        t.plan(7);

        const a = new Uint8Array([1, 2]).buffer;
        a[0] = 5;
        a[8] = 9;

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object ArrayBuffer]');
        t.equal(decoded.byteLength, 2);
        t.deepEqual(new Uint8Array(decoded), [1, 2]);
        t.equal(decoded[0], 5);
        t.equal(decoded[8], 9);
        t.equal(decoded['0'], 5);
        t.equal(decoded['8'], 9);
    });

    StandardObjectTests('ArrayBuffer', 'ArrayBuffer', () => {
        return new Uint8Array(2).buffer;
    });

    test('ArrayBuffer: Encoding Expected', (t) => {
        t.plan(1);

        const a = new Uint8Array([1]).buffer;
        a.b = false;

        t.deepEqual(testHelpers.simplifyEncoded(encode(a)), {
            W: 'N0 S0 $3',
            N: '4',
            S: [
                'b',
            ],
            r: 'W0',
        });
    });
}
else {
    console.log('Tests for ArrayBuffer type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
