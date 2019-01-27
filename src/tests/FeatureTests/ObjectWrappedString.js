const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Object-Wrapped String: Normal', (t) => {
    t.plan(3);

    const decodedValue = decode(encode([new String('test')]))[0];

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object String]');
    t.equal(decodedValue.valueOf(), 'test');
});

test('Object-Wrapped String: Empty String', (t) => {
    t.plan(3);

    const decodedValue = decode(encode([new String('')]))[0];

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object String]');
    t.equal(decodedValue.valueOf(), '');
});

test('Object-Wrapped String: Root Value Normal', (t) => {
    t.plan(3);

    const decodedValue = decode(encode(new String('test')));

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object String]');
    t.equal(decodedValue.valueOf(), 'test');
});

test('Object-Wrapped String: Root Value Empty String', (t) => {
    t.plan(3);

    const decodedValue = decode(encode(new String('')));

    t.equal(typeof decodedValue, 'object');
    t.equal(testHelpers.systemName(decodedValue), '[object String]');
    t.equal(decodedValue.valueOf(), '');
});

StandardObjectTests('Object-Wrapped String', 'String', () => {
    return new String('string');
});

test('Object-Wrapped String: Encoding Expected', (t) => {
    t.plan(1);

    const source = new String('a');
    source.a = false;

    t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
        ST: [
            [
                [
                    'St0',
                ],
                [
                    'St0',
                ],
                [
                    'fa',
                ],
            ],
        ],
        St: [
            'a',
        ],
        r: 'ST0',
    });
});
