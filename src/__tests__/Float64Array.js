const test = require('tape');
const jsonComplete = require('../main.js');
const testHelpers = require('../../_tools/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Float64Array: Normal', (t) => {
    t.plan(3);

    const a = new Float64Array(2);
    a[0] = 1.2;
    a[1] = 2.7;

    const decoded = decode(encode([a]))[0];

    t.equal(testHelpers.systemName(decoded), '[object Float64Array]');
    t.ok(Math.abs(decoded[0] - 1.2) < 0.00001);
    t.ok(Math.abs(decoded[1] - 2.7) < 0.00001);
});

test('Float64Array: Empty Cells', (t) => {
    t.plan(2);

    const a = new Float64Array(2);
    a[0] = 1.2;

    const decoded = decode(encode([a]))[0];

    t.ok(Math.abs(decoded[0] - 1.2) < 0.00001);
    t.equal(decoded[1], 0);
});

test('Float64Array: Root Value', (t) => {
    t.plan(1);
    t.deepEqual(decode(encode(new Float64Array([1]))), new Float64Array([1]));
});

test('Float64Array: Arbitrary Attached Data', (t) => {
    t.plan(2);

    const a = new Float64Array(2);
    a.x = 2;
    a[Symbol.for('Float64Array')] = 'test';

    const decoded = decode(encode([a]))[0];

    t.equal(decoded.x, 2);
    t.equal(decoded[Symbol.for('Float64Array')], 'test');
});

test('Float64Array: Self-Containment', (t) => {
    t.plan(1);

    const a = new Float64Array(2);
    a.me = a;

    const decoded = decode(encode([a]))[0];

    t.equal(decoded.me, decoded);
});

test('Float64Array: Referencial Integrity', (t) => {
    t.plan(2);

    const source = new Float64Array(1);

    const decoded = decode(encode({
        x: source,
        y: source,
    }));

    t.equal(decoded.x, decoded.y);
    t.notEqual(decoded.x, source);
});
