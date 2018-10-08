const test = require('tape');
const jsonComplete = require('../main.js');
const testHelpers = require('../../_tools/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Int8Array: Normal', (t) => {
    t.plan(3);

    const a = new Int8Array(2);
    a[0] = 1;
    a[1] = 2;

    const decoded = decode(encode([a]))[0];

    t.equal(testHelpers.systemName(decoded), '[object Int8Array]');
    t.equal(decoded[0], 1);
    t.equal(decoded[1], 2);
});

test('Int8Array: Empty Cells', (t) => {
    t.plan(2);

    const a = new Int8Array(2);
    a[0] = 1;

    const decoded = decode(encode([a]))[0];

    t.equal(decoded[0], 1);
    t.equal(decoded[1], 0);
});

test('Int8Array: Arbitrary Attached Data', (t) => {
    t.plan(2);

    const a = new Int8Array(2);
    a.x = 2;
    a[Symbol.for('Int8Array')] = 'test';

    const decoded = decode(encode([a]))[0];

    t.equal(decoded.x, 2);
    t.equal(decoded[Symbol.for('Int8Array')], 'test');
});

test('Int8Array: Self-Containment', (t) => {
    t.plan(1);

    const a = new Int8Array(2);
    a.me = a;

    const decoded = decode(encode([a]))[0];

    t.equal(decoded.me, decoded);
});
