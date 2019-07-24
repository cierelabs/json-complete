const test = require('tape');
const jsonComplete = require('/main.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

const extremeSizeNumber = '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';
const encodedExtremeSizeNumber = '4zhmu9\'id5p]%x8>l&yq4zhmu9\'id5p]%x8>l&yq4zhmu9\'id5p]%x8>l&yq4zhmu9\'';

if (typeof BigInt === 'function') {
    test('BigInt: Normal', (t) => {
        t.plan(1);
        t.equal(decode(encode([BigInt(1)]))[0], BigInt(1));
    });

    test('BigInt: 0', (t) => {
        t.plan(1);
        t.equal(decode(encode([BigInt(0)]))[0], BigInt(0));
    });

    test('BigInt: -0', (t) => {
        t.plan(1);
        // BigInt defines only positive 0
        t.equal(decode(encode([BigInt(-0)]))[0], BigInt(0));
    });

    test('BigInt: Extreme Size Positive', (t) => {
        t.plan(1);
        t.equal(String(decode(encode([BigInt(extremeSizeNumber)]))[0]), extremeSizeNumber);
    });

    test('BigInt: Extreme Size Negative', (t) => {
        t.plan(1);
        let negatedNumber = `-${extremeSizeNumber}`;
        t.equal(String(decode(encode([BigInt(negatedNumber)]))[0]), negatedNumber);
    });

    test('BigInt: Root Value Normal', (t) => {
        t.plan(1);
        t.equal(decode(encode(BigInt(1))), BigInt(1));
    });

    test('BigInt: Root Value 0', (t) => {
        t.plan(1);
        t.equal(decode(encode(BigInt(0))), BigInt(0));
    });

    test('BigInt: Root Value Extreme Size', (t) => {
        t.plan(1);
        t.equal(String(decode(encode(BigInt(extremeSizeNumber)))), extremeSizeNumber);
    });

    test('BigInt: Encoding Expected Normal', (t) => {
        t.plan(1);

        t.deepEqual(testHelpers.simplifyEncoded(encode(BigInt(extremeSizeNumber))), {
            I: encodedExtremeSizeNumber,
            r: 'I0',
        });
    });
}
else {
    console.log('Tests for BigInt type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
