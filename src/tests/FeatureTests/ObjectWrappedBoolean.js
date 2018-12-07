const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

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

test('Object-Wrapped Boolean: Arbitrary Attached Data', (t) => {
    t.plan(3);

    const bool = new Boolean(false);
    bool.x = 2;
    bool[Symbol.for('boolean')] = 'test';

    const decodedBooleanObj = decode(encode([bool], {
        encodeSymbolKeys: true,
    }))[0];

    t.equal(decodedBooleanObj.valueOf(), false);
    t.equal(decodedBooleanObj.x, 2);
    t.equal(decodedBooleanObj[Symbol.for('boolean')], 'test');
});

test('Object-Wrapped Boolean: Self-Containment', (t) => {
    t.plan(2);

    const bool = new Boolean(false);
    bool.me = bool;

    const decodedBooleanObj = decode(encode([bool]))[0];

    t.equal(decodedBooleanObj.valueOf(), false);
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

test('Object-Wrapped Boolean: Encoding Expected', (t) => {
    t.plan(1);

    const source = new Boolean(true);
    source.a = false;

    t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
        Bo: [
            [
                'tr',
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
        r: 'Bo0',
    });
});
