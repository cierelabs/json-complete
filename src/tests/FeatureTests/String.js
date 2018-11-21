const test = require('tape');
const jsonComplete = require('/main.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('String: Normal', (t) => {
    t.plan(1);
    t.equal(decode(encode(['string']))[0], 'string');
});

test('String: Empty', (t) => {
    t.plan(1);
    t.equal(decode(encode(['']))[0], '');
});

test('String: Root Value Normal', (t) => {
    t.plan(1);
    t.equal(decode(encode('y')), 'y');
});

test('String: Root Value Empty', (t) => {
    t.plan(1);
    t.equal(decode(encode('')), '');
});

test('String: Encoding Expected', (t) => {
    t.plan(1);

    t.deepEqual(testHelpers.simplifyEncoded(encode('a')), {
        st: [
            'a',
        ],
        r: 'st0',
    });
});
