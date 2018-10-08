const test = require('tape');
const jsonComplete = require('../main.js');
const testHelpers = require('../../_tools/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Object-Wrapped Number: Normal', (t) => {
    t.plan(3);

    const decodedValue = decode(encode([new Number(1)]))[0];

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Number]');
    t.equal(Number.prototype.valueOf.call(decodedValue), 1);
});

test('Object-Wrapped Number: Zero', (t) => {
    t.plan(3);

    const decodedValue = decode(encode([new Number(0)]))[0];

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Number]');
    t.equal(Number.prototype.valueOf.call(decodedValue), 0);
});

test('Object-Wrapped Number: Negative Zero', (t) => {
    t.plan(3);

    const decodedValue = decode(encode([new Number(-0)]))[0];

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Number]');
    t.ok(testHelpers.isNegativeZero(Number.prototype.valueOf.call(decodedValue)));
});

test('Object-Wrapped Number: Infinity', (t) => {
    t.plan(3);

    const decodedValue = decode(encode([new Number(Infinity)]))[0];

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Number]');
    t.equal(Number.prototype.valueOf.call(decodedValue), Infinity);
});

test('Object-Wrapped Number: -Infinity', (t) => {
    t.plan(3);

    const decodedValue = decode(encode([new Number(-Infinity)]))[0];

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Number]');
    t.equal(Number.prototype.valueOf.call(decodedValue), -Infinity);
});

test('Object-Wrapped Number: NaN', (t) => {
    t.plan(3);

    const decodedValue = decode(encode([new Number(NaN)]))[0];

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Number]');
    t.ok(testHelpers.isNanValue(Number.prototype.valueOf.call(decodedValue)));
});

test('Object-Wrapped Number: Arbitrary Attached Data', (t) => {
    t.plan(3);

    const num = new Number(1);
    num.x = 2;
    num[Symbol.for('number')] = 'test';

    const decodedNumberObj = decode(encode([num]))[0];

    t.equal(Number.prototype.valueOf.call(decodedNumberObj), 1);
    t.equal(decodedNumberObj.x, 2);
    t.equal(decodedNumberObj[Symbol.for('number')], 'test');
});

test('Object-Wrapped Number: Self-Containment', (t) => {
    t.plan(2);

    const num = new Number(1);
    num.me = num;

    const decodedNumberObj = decode(encode([num]))[0];

    t.equal(Number.prototype.valueOf.call(decodedNumberObj), 1);
    t.equal(decodedNumberObj.me, decodedNumberObj);
});
