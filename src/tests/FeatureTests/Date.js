const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

const testDate = 954583260000;
const testDateEncodedNumber = '#km39)))';

test('Date: Normal', (t) => {
    t.plan(1);
    t.equal(decode(encode([new Date(testDate)]))[0].getTime(), testDate);
});

test('Date: Invalid Date', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNanValue(decode(encode([new Date('')]))[0].getTime()));
});

test('Date: Root Value Normal', (t) => {
    t.plan(1);
    t.equal(decode(encode(new Date(testDate))).getTime(), testDate);
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

    const date = new Date(testDate);
    date.a = false;

    t.deepEqual(testHelpers.simplifyEncoded(encode(date)), {
        D: 'N0 S0 $3',
        S: [
            'a',
        ],
        N: testDateEncodedNumber,
        r: 'D0',
    });
});
