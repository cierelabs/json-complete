import test from '/tests/tape.js';
import jsonComplete from '/main.js';
import testHelpers from '/tests/testHelpers.js';

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Undefined: Normal', (t) => {
    t.plan(1);

    t.equal(decode(encode([void 0]))[0], void 0);
});

test('Undefined: Root Value', (t) => {
    t.plan(1);

    t.equal(decode(encode(void 0)), void 0);
});

test('Undefined: Encoding Expected', (t) => {
    t.plan(1);

    t.deepEqual(testHelpers.simplifyEncoded(encode(void 0)), {
        r: '$0',
    });
});
