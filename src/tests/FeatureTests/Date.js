const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Date: Normal', (t) => {
    t.plan(1);
    const now = Date.now();
    t.equal(decode(encode([new Date(now)]))[0].getTime(), now);
});

test('Date: Invalid Date', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNanValue(decode(encode([new Date('')]))[0].getTime()));
});

test('Date: Root Value Normal', (t) => {
    t.plan(1);
    const now = Date.now();
    t.equal(decode(encode(new Date(now))).getTime(), now);
});

test('Date: Root Value Invalid Date', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNanValue(decode(encode(new Date(''))).getTime()));
});

StandardObjectTests('Date', 'Date', () => {
    return new Date();
});

test('Date: Encoding Expected', (t) => {
    t.plan(1);

    const now = Date.now();
    const date = new Date(now);
    date.a = false;

    t.deepEqual(testHelpers.simplifyEncoded(encode(date)), {
        D: 'N0 S0 F0',
        S: [
            'a',
        ],
        N: String(now),
        r: 'D0',
    });
});
