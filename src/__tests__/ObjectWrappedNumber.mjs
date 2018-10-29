const test = require('tape');
import testHelpers from '/_tools/testHelpers.mjs';
import jsonComplete from '/src/main.mjs';

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Object-Wrapped Number: Normal', (t) => {
    t.plan(3);

    const decodedValue = decode(encode([new Number(1)]))[0];

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Number]');
    t.equal(decodedValue.valueOf(), 1);
});

test('Object-Wrapped Number: 0', (t) => {
    t.plan(3);

    const decodedValue = decode(encode([new Number(0)]))[0];

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Number]');
    t.equal(decodedValue.valueOf(), 0);
});

test('Object-Wrapped Number: -0', (t) => {
    t.plan(3);

    const decodedValue = decode(encode([new Number(-0)]))[0];

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Number]');
    t.ok(testHelpers.isNegativeZero(decodedValue.valueOf()));
});

test('Object-Wrapped Number: Infinity', (t) => {
    t.plan(3);

    const decodedValue = decode(encode([new Number(Infinity)]))[0];

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Number]');
    t.equal(decodedValue.valueOf(), Infinity);
});

test('Object-Wrapped Number: -Infinity', (t) => {
    t.plan(3);

    const decodedValue = decode(encode([new Number(-Infinity)]))[0];

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Number]');
    t.equal(decodedValue.valueOf(), -Infinity);
});

test('Object-Wrapped Number: NaN', (t) => {
    t.plan(3);

    const decodedValue = decode(encode([new Number(NaN)]))[0];

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Number]');
    t.ok(testHelpers.isNanValue(decodedValue.valueOf()));
});

test('Object-Wrapped Number: Root Value Normal', (t) => {
    t.plan(1);
    t.equal(decode(encode(new Number(1))).valueOf(), 1);
});

test('Object-Wrapped Number: Root Value Infinity', (t) => {
    t.plan(1);
    t.equal(decode(encode(new Number(Infinity))).valueOf(), Infinity);
});

test('Object-Wrapped Number: Root Value -Infinity', (t) => {
    t.plan(1);
    t.equal(decode(encode(new Number(-Infinity))).valueOf(), -Infinity);
});

test('Object-Wrapped Number: Root Value NaN', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNanValue(decode(encode(new Number(NaN))).valueOf()));
});

test('Object-Wrapped Number: Root Value -0', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNegativeZero(decode(encode(new Number(-0))).valueOf()));
});

test('Object-Wrapped Number: Arbitrary Attached Data', (t) => {
    t.plan(3);

    const num = new Number(1);
    num.x = 2;
    num[Symbol.for('number')] = 'test';

    const decodedNumberObj = decode(encode([num]))[0];

    t.equal(decodedNumberObj.valueOf(), 1);
    t.equal(decodedNumberObj.x, 2);
    t.equal(decodedNumberObj[Symbol.for('number')], 'test');
});

test('Object-Wrapped Number: Self-Containment', (t) => {
    t.plan(2);

    const num = new Number(1);
    num.me = num;

    const decodedNumberObj = decode(encode([num]))[0];

    t.equal(decodedNumberObj.valueOf(), 1);
    t.equal(decodedNumberObj.me, decodedNumberObj);
});

test('Object-Wrapped Number: Referencial Integrity', (t) => {
    t.plan(2);

    const source = new Number(1);

    const decoded = decode(encode({
        x: source,
        y: source,
    }));

    t.equal(decoded.x, decoded.y);
    t.notEqual(decoded.x, source);
});
