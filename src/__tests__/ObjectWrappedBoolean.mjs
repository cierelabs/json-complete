const test = require('tape');
import testHelpers from '/_tools/testHelpers.mjs';
import jsonComplete from '/src/main.mjs';

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Object-Wrapped Boolean: true', (t) => {
    t.plan(3);

    const decodedValue = decode(encode([new Boolean(true)]))[0];

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Boolean]');
    t.equal(Boolean.prototype.valueOf.call(decodedValue), true);
});

test('Object-Wrapped Boolean: false', (t) => {
    t.plan(3);

    const decodedValue = decode(encode([new Boolean(false)]))[0];

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Boolean]');
    t.equal(Boolean.prototype.valueOf.call(decodedValue), false);
});

test('Object-Wrapped Boolean: Root Value true', (t) => {
    t.plan(3);

    const decodedValue = decode(encode(new Boolean(true)));

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Boolean]');
    t.equal(Boolean.prototype.valueOf.call(decodedValue), true);
});

test('Object-Wrapped Boolean: Root Value false', (t) => {
    t.plan(3);

    const decodedValue = decode(encode(new Boolean(false)));

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Boolean]');
    t.equal(Boolean.prototype.valueOf.call(decodedValue), false);
});

test('Object-Wrapped Boolean: Arbitrary Attached Data', (t) => {
    t.plan(3);

    const bool = new Boolean(false);
    bool.x = 2;
    bool[Symbol.for('boolean')] = 'test';

    const decodedBooleanObj = decode(encode([bool]))[0];

    t.equal(Boolean.prototype.valueOf.call(decodedBooleanObj), false);
    t.equal(decodedBooleanObj.x, 2);
    t.equal(decodedBooleanObj[Symbol.for('boolean')], 'test');
});

test('Object-Wrapped Boolean: Self-Containment', (t) => {
    t.plan(2);

    const bool = new Boolean(false);
    bool.me = bool;

    const decodedBooleanObj = decode(encode([bool]))[0];

    t.equal(Boolean.prototype.valueOf.call(decodedBooleanObj), false);
    t.equal(decodedBooleanObj.me, decodedBooleanObj);
});

test('Object-Wrapped Boolean: Referencial Integrity', (t) => {
    t.plan(2);

    const source = new Boolean(true);

    const decoded = decode(encode({
        x: source,
        y: source,
    }));

    t.equal(decoded.x, decoded.y);
    t.notEqual(decoded.x, source);
});
