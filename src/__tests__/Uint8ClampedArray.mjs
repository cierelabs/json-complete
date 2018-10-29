const test = require('tape');
import testHelpers from '/_tools/testHelpers.mjs';
import jsonComplete from '/src/main.mjs';

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

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

test('Uint8ClampedArray: Arbitrary Attached Data', (t) => {
    t.plan(2);

    const a = new Uint8ClampedArray(2);
    a.x = 2;
    a[Symbol.for('Uint8ClampedArray')] = 'test';

    const decoded = decode(encode([a]))[0];

    t.equal(decoded.x, 2);
    t.equal(decoded[Symbol.for('Uint8ClampedArray')], 'test');
});

test('Uint8ClampedArray: Self-Containment', (t) => {
    t.plan(1);

    const a = new Uint8ClampedArray(2);
    a.me = a;

    const decoded = decode(encode([a]))[0];

    t.equal(decoded.me, decoded);
});

test('Uint8ClampedArray: Referencial Integrity', (t) => {
    t.plan(2);

    const source = new Uint8ClampedArray(1);

    const decoded = decode(encode({
        x: source,
        y: source,
    }));

    t.equal(decoded.x, decoded.y);
    t.notEqual(decoded.x, source);
});
