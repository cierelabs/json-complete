const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Error: Normal', (t) => {
    t.plan(3);

    const value = new Error('e');
    value.stack = 'stack';

    const decoded = decode(encode([value]))[0];

    t.ok(decoded instanceof Error);
    t.equal(decoded.message, 'e');
    t.equal(decoded.stack, 'stack');
});

test('Error: Empty Message', (t) => {
    t.plan(2);

    const value = new Error();

    const decoded = decode(encode([value]))[0];

    t.ok(decoded instanceof Error);
    t.equal(decoded.message, '');
});

test('Error: Empty Stack', (t) => {
    t.plan(3);

    const value = new Error('a');

    const decoded = decode(encode([value]))[0];

    t.ok(decoded instanceof Error);
    t.equal(testHelpers.systemName(decoded.stack), '[object String]');
    t.ok(decoded.stack.length > 0);
});

test('Error: Root Value', (t) => {
    t.plan(3);

    const value = new Error('a');
    value.stack = 'stack';

    const decoded = decode(encode(value));

    t.ok(decoded instanceof Error);
    t.equal(decoded.message, 'a');
    t.equal(decoded.stack, 'stack');
});

test('Error: EvalError', (t) => {
    t.plan(1);

    const value = new EvalError('a');

    const decoded = decode(encode([value]))[0];

    t.ok(decoded instanceof EvalError);
});

test('Error: RangeError', (t) => {
    t.plan(1);

    const value = new RangeError('a');

    const decoded = decode(encode([value]))[0];

    t.ok(decoded instanceof RangeError);
});

test('Error: ReferenceError', (t) => {
    t.plan(1);

    const value = new ReferenceError('a');

    const decoded = decode(encode([value]))[0];

    t.ok(decoded instanceof ReferenceError);
});

test('Error: SyntaxError', (t) => {
    t.plan(1);

    const value = new SyntaxError('a');

    const decoded = decode(encode([value]))[0];

    t.ok(decoded instanceof SyntaxError);
});

test('Error: TypeError', (t) => {
    t.plan(1);

    const value = new TypeError('a');

    const decoded = decode(encode([value]))[0];

    t.ok(decoded instanceof TypeError);
});

test('Error: URIError', (t) => {
    t.plan(1);

    const value = new URIError('a');

    const decoded = decode(encode([value]))[0];

    t.ok(decoded instanceof URIError);
});

test('Error: Arbitrary Attached Data', (t) => {
    t.plan(3);

    const value = new Error('a');

    value.x = 2;
    value[Symbol.for('error')] = 'test';

    const decoded = decode(encode([value], {
        encodeSymbolKeys: true,
    }))[0];

    t.ok(decoded instanceof Error);
    t.equal(decoded.x, 2);
    t.equal(decoded[Symbol.for('error')], 'test');
});

test('Error: Self-Containment', (t) => {
    t.plan(2);

    const value = new Error('a');

    value.me = value;

    const decoded = decode(encode([value]))[0];

    t.ok(decoded instanceof Error);
    t.equal(decoded.me, decoded);
});

test('Error: Referencial Integrity', (t) => {
    t.plan(2);

    const source = new Error('a');

    const decoded = decode(encode({
        x: source,
        y: source,
    }));

    t.equal(decoded.x, decoded.y);
    t.notEqual(decoded.x, source);
});

test('Error: Encoding Expected', (t) => {
    t.plan(1);

    const value = new Error('a');
    value.a = false;

    const encoded = testHelpers.simplifyEncoded(encode(value));
    encoded.St[2] = 'stack!!!';

    t.deepEqual(encoded, {
        Er: [
            [
                [
                    'St0',
                    'St1',
                    'St2',
                ],
                [
                    'St1',
                    'fa',
                ],
            ],
        ],
        St: [
            'Error',
            'a',
            'stack!!!',
        ],
        r: 'Er0',
    });
});
