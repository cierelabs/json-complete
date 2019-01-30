const test = require('tape');
const jsonComplete = require('/main.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Boolean: true', (t) => {
    t.plan(1);

    t.equal(decode(encode([true]))[0], true);
});

test('Boolean: false', (t) => {
    t.plan(1);

    t.equal(decode(encode([false]))[0], false);
});

test('Boolean: Root Value true', (t) => {
    t.plan(1);

    t.equal(decode(encode(true)), true);
});

test('Boolean: Root Value false', (t) => {
    t.plan(1);

    t.equal(decode(encode(false)), false);
});

test('Boolean: Encoding Expected', (t) => {
    t.plan(1);

    t.deepEqual(testHelpers.simplifyEncoded(encode(false)), {
        r: 'F',
    });
});
