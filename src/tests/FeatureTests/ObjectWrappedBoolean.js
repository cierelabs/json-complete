const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Object-Wrapped Boolean: true', (t) => {
    t.plan(3);

    const decodedValue = decode(encode([new Boolean(true)]))[0];

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Boolean]');
    t.equal(decodedValue.valueOf(), true);
});

test('Object-Wrapped Boolean: false', (t) => {
    t.plan(3);

    const decodedValue = decode(encode([new Boolean(false)]))[0];

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Boolean]');
    t.equal(decodedValue.valueOf(), false);
});

test('Object-Wrapped Boolean: Root Value true', (t) => {
    t.plan(3);

    const decodedValue = decode(encode(new Boolean(true)));

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Boolean]');
    t.equal(decodedValue.valueOf(), true);
});

test('Object-Wrapped Boolean: Root Value false', (t) => {
    t.plan(3);

    const decodedValue = decode(encode(new Boolean(false)));

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object Boolean]');
    t.equal(decodedValue.valueOf(), false);
});

StandardObjectTests('Object-Wrapped Boolean', 'Boolean', () => {
    return new Boolean(false);
});

test('Object-Wrapped Boolean: Encoding Expected', (t) => {
    t.plan(1);

    const source = new Boolean(true);
    source.a = false;

    t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
        B: 'T0 S0 F0',
        S: [
            'a',
        ],
        r: 'B0',
    });
});
