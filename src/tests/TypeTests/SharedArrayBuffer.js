const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof SharedArrayBuffer === 'function') {
    test('SharedArrayBuffer: Normal', (t) => {
        t.plan(3);

        const sab = new SharedArrayBuffer(2);
        const a = new Uint8Array(sab);

        a[0] = 1;
        a[1] = 2;

        const decoded = decode(encode([sab]))[0];

        t.equal(testHelpers.systemName(decoded), '[object SharedArrayBuffer]');
        t.equal(decoded.byteLength, 2);
        t.deepEqual(new Uint8Array(decoded), [1, 2]);
    });

    test('SharedArrayBuffer: Empty Cells', (t) => {
        t.plan(4);

        const sab = new SharedArrayBuffer(2);
        const a = new Uint8Array(sab);

        a[0] = 1;

        const decoded = decode(encode([sab]))[0];

        t.equal(testHelpers.systemName(decoded), '[object SharedArrayBuffer]');
        t.equal(decoded.byteLength, 2);
        t.equal(new Uint8Array(decoded)[0], 1);
        t.equal(new Uint8Array(decoded)[1], 0);
    });

    test('SharedArrayBuffer: Empty', (t) => {
        t.plan(2);

        const sab = new SharedArrayBuffer(0);

        const decoded = decode(encode([sab]))[0];

        t.equal(testHelpers.systemName(decoded), '[object SharedArrayBuffer]');
        t.equal(decoded.byteLength, 0);
    });

    test('SharedArrayBuffer: Root Value', (t) => {
        t.plan(1);

        const sab = new SharedArrayBuffer(2);
        const a = new Uint8Array(sab);

        a[0] = 1;

        t.deepEqual(new Uint8Array(decode(encode(sab))), new Uint8Array([1, 0]));
    });

    test('SharedArrayBuffer: Index Key', (t) => {
        t.plan(7);

        const sab = new SharedArrayBuffer(2);
        const a = new Uint8Array(sab);

        a[0] = 1;
        a[1] = 2;
        sab[0] = 5;
        sab[8] = 9;

        const decoded = decode(encode([sab]))[0];

        t.equal(testHelpers.systemName(decoded), '[object SharedArrayBuffer]');
        t.equal(decoded.byteLength, 2);
        t.deepEqual(new Uint8Array(decoded), [1, 2]);
        t.equal(decoded[0], 5);
        t.equal(decoded[8], 9);
        t.equal(decoded['0'], 5);
        t.equal(decoded['8'], 9);
    });

    test('SharedArrayBuffer: Arbitrary Attached Data', (t) => {
        t.plan(2);

        const sab = new SharedArrayBuffer(2);

        sab.x = 2;
        sab[Symbol.for('SharedArrayBuffer')] = 'test';

        const decoded = decode(encode([sab]))[0];

        t.equal(decoded.x, 2);
        t.equal(decoded[Symbol.for('SharedArrayBuffer')], 'test');
    });

    test('SharedArrayBuffer: Self-Containment', (t) => {
        t.plan(1);

        const sab = new SharedArrayBuffer(2);
        sab.me = sab;

        const decoded = decode(encode([sab]))[0];

        t.equal(decoded.me, decoded);
    });

    test('SharedArrayBuffer: Referencial Integrity', (t) => {
        t.plan(2);

        const source = new SharedArrayBuffer(2);

        const decoded = decode(encode({
            x: source,
            y: source,
        }));

        t.equal(decoded.x, decoded.y);
        t.notEqual(decoded.x, source);
    });
}
