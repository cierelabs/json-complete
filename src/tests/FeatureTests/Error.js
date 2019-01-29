const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

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

    const expectedStackType = value.stack === void 0 ? '[object Undefined]' : '[object String]';

    const decoded = decode(encode([value]))[0];

    t.ok(decoded instanceof Error);
    t.equal(testHelpers.systemName(decoded.stack), expectedStackType);
    t.ok(String(decoded.stack).length > 0);
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

StandardObjectTests('Error', 'Error', () => {
    return new Error('a');
});

test('Error: Encoding Expected', (t) => {
    t.plan(1);

    const value = new Error('');
    value.stack = '';

    const encoded = testHelpers.simplifyEncoded(encode(value));

    // Remove extra properties a given browser might have added (namely, Safari)
    delete encoded.N;
    encoded.S = encoded.S.slice(0, 2);
    encoded.E = encoded.E.split(' ')[0];

    t.deepEqual(encoded, {
        E: 'S0S1S1',
        S: [
            'Error',
            '',
        ],
        r: 'E0',
    });
});
