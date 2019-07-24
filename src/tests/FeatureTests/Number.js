const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Number: Normal', (t) => {
    t.plan(1);
    t.equal(decode(encode([1]))[0], 1);
});

test('Number: 0', (t) => {
    t.plan(1);
    t.equal(decode(encode([0]))[0], 0);
});

test('Number: -1', (t) => {
    t.plan(1);
    t.equal(decode(encode([-1]))[0], -1);
});

test('Number: 3.14', (t) => {
    t.plan(1);
    t.equal(decode(encode([3.14]))[0], 3.14);
});

test('Number: Infinity', (t) => {
    t.plan(1);
    t.equal(decode(encode([Infinity]))[0], Infinity);
});

test('Number: -Infinity', (t) => {
    t.plan(1);
    t.equal(decode(encode([-Infinity]))[0], -Infinity);
});

test('Number: NaN', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNanValue(decode(encode([NaN]))[0]));
});

test('Number: -0', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNegativeZero(decode(encode([-0]))[0]));
});

test('Number: Root Value Number', (t) => {
    t.plan(1);
    t.equal(decode(encode(1)), 1);
});

test('Number: Root Value -1', (t) => {
    t.plan(1);
    t.equal(decode(encode(-1)), -1);
});

test('Number: Root Value 3.14', (t) => {
    t.plan(1);
    t.equal(decode(encode(3.14)), 3.14);
});

test('Number: Root Value Infinity', (t) => {
    t.plan(1);
    t.equal(decode(encode(Infinity)), Infinity);
});

test('Number: Root Value -Infinity', (t) => {
    t.plan(1);
    t.equal(decode(encode(-Infinity)), -Infinity);
});

test('Number: Root Value NaN', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNanValue(decode(encode(NaN))));
});

test('Number: Encoding Expected Normal', (t) => {
    t.plan(1);

    t.deepEqual(testHelpers.simplifyEncoded(encode(1)), {
        N: '4',
        r: 'N0',
    });
});

test('Number: Encoding Expected Infinity', (t) => {
    t.plan(1);

    t.deepEqual(testHelpers.simplifyEncoded(encode(Infinity)), {
        r: '$4',
    });
});

test('Number: Encoding Expected -Infinity', (t) => {
    t.plan(1);

    t.deepEqual(testHelpers.simplifyEncoded(encode(-Infinity)), {
        r: '$5',
    });
});

test('Number: Encoding Expected NaN', (t) => {
    t.plan(1);

    t.deepEqual(testHelpers.simplifyEncoded(encode(NaN)), {
        r: '$6',
    });
});

test('Number: Encoding Expected -0', (t) => {
    t.plan(1);

    t.deepEqual(testHelpers.simplifyEncoded(encode(-0)), {
        r: '$7',
    });
});
