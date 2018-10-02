const test = require('tape');
const jsonComplete = require('../main.js');
const testHelpers = require('../../_tools/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('RootValue: undefined', (t) => {
    t.plan(1);

    t.equal(decode(encode(void 0)), void 0);
});

test('RootValue: null', (t) => {
    t.plan(1);
    t.equal(decode(encode(null)), null);
});

test('RootValue: true', (t) => {
    t.plan(1);
    t.equal(decode(encode(true)), true);
});

test('RootValue: false', (t) => {
    t.plan(1);
    t.equal(decode(encode(false)), false);
});

test('RootValue: NaN', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNanValue(decode(encode(NaN))));
});

test('RootValue: Infinity', (t) => {
    t.plan(1);
    t.equal(decode(encode(Infinity)), Infinity);
});

test('RootValue: -Infinity', (t) => {
    t.plan(1);
    t.equal(decode(encode(-Infinity)), -Infinity);
});

test('RootValue: -0', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNegativeZero(decode(encode(-0))));
});

test('RootValue: Number', (t) => {
    t.plan(1);
    t.equal(decode(encode(1)), 1);
});

test('RootValue: String', (t) => {
    t.plan(1);
    t.equal(decode(encode('y')), 'y');
});

test('RootValue: String: Empty', (t) => {
    t.plan(1);
    t.equal(decode(encode('')), '');
});

test('RootValue: Regex: Source', (t) => {
    t.plan(1);
    t.equal(decode(encode(/\s+/g)).source, '\\s+');
});

test('RootValue: Regex: Flags', (t) => {
    t.plan(1);
    t.equal(decode(encode(/\s+/g)).flags, 'g');
});

test('RootValue: Regex: lastIndex', (t) => {
    t.plan(1);
    t.equal(decode(encode(/\s+/g)).lastIndex, 0);
});

test('RootValue: Date', (t) => {
    t.plan(1);
    const now = Date.now();
    t.equal(decode(encode(new Date(now))).getTime(), now);
});

test('RootValue: Date: Invalid Date', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNanValue(decode(encode(new Date(''))).getTime()));
});

test('RootValue: Symbol', (t) => {
    t.plan(1);
    t.ok(testHelpers.isSymbol(decode(encode(Symbol()))));
});

test('RootValue: Symbol: Registered Symbol', (t) => {
    t.plan(1);
    t.equal(decode(encode(Symbol.for('x'))), Symbol.for('x'));
});

test('RootValue: Function', (t) => {
    t.plan(2);
    const decodedFunction = decode(encode(() => { return 1; }));
    t.ok(testHelpers.isFunction(decodedFunction));
    t.equal(decodedFunction(), 1);
});

test('RootValue: Object', (t) => {
    t.plan(1);
    t.deepEqual(decode(encode({ a: 1 })), { a: 1 });
});

test('RootValue: Array', (t) => {
    t.plan(1);
    t.deepEqual(decode(encode([1, 2])), [1, 2]);
});