import test from '/tests/tape.js';
import jsonComplete from '/main.js';
import StandardObjectTests from '/tests/StandardObjectTests.js';
import testHelpers from '/tests/testHelpers.js';

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

StandardObjectTests('Object-Wrapped Number', 'Number', () => {
    return new Number(1);
});

test('Object-Wrapped Number: Encoding Expected Normal', (t) => {
    t.plan(1);

    const source = new Number(1);
    source.a = false;

    t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
        H: 'N0 S0 $3',
        N: '4',
        S: [
            'a',
        ],
        r: 'H0',
    });
});

test('Object-Wrapped Number: Encoding Expected Infinity', (t) => {
    t.plan(1);

    const source = new Number(Infinity);

    t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
        H: '$4',
        r: 'H0',
    });
});

test('Object-Wrapped Number: Encoding Expected -Infinity', (t) => {
    t.plan(1);

    const source = new Number(-Infinity);

    t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
        H: '$5',
        r: 'H0',
    });
});

test('Object-Wrapped Number: Encoding Expected NaN', (t) => {
    t.plan(1);

    const source = new Number(NaN);

    t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
        H: '$6',
        r: 'H0',
    });
});

test('Object-Wrapped Number: Encoding Expected -0', (t) => {
    t.plan(1);

    const source = new Number(-0);

    t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
        H: '$7',
        r: 'H0',
    });
});
