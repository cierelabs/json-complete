const test = require('tape');
const jsonComplete = require('../main.js');
const testHelpers = require('../../_tools/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

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

test('Float32Array: Root Value', (t) => {
    t.plan(1);
    t.deepEqual(decode(encode(new Float32Array([1]))), new Float32Array([1]));
});

test('Float32Array: Arbitrary Attached Data', (t) => {
    t.plan(2);

    const a = new Float32Array(2);
    a.x = 2;
    a[Symbol.for('Float32Array')] = 'test';

    const decoded = decode(encode([a]))[0];

    t.equal(decoded.x, 2);
    t.equal(decoded[Symbol.for('Float32Array')], 'test');
});

test('Float32Array: Self-Containment', (t) => {
    t.plan(1);

    const a = new Float32Array(2);
    a.me = a;

    const decoded = decode(encode([a]))[0];

    t.equal(decoded.me, decoded);
});

test('Float32Array: Referencial Integrity', (t) => {
    t.plan(2);

    const source = new Float32Array(1);

    const decoded = decode(encode({
        x: source,
        y: source,
    }));

    t.equal(decoded.x, decoded.y);
    t.notEqual(decoded.x, source);
});
