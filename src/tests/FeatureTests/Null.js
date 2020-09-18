import test from '/tests/tape.js';
import testHelpers from '/tests/testHelpers.js';
import jsonComplete from '/main.js';

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Null: Normal', (t) => {
    t.plan(1);

    t.equal(decode(encode([null]))[0], null);
});

test('Null: Root Value', (t) => {
    t.plan(1);

    t.equal(decode(encode(null)), null);
});

test('Null: Encoding Expected', (t) => {
    t.plan(1);

    t.deepEqual(testHelpers.simplifyEncoded(encode(null)), {
        r: '$1',
    });
});
