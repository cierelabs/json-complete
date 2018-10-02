const test = require('tape');
const jsonComplete = require('../main.js');
const testHelpers = require('../../_tools/testHelpers.js');

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
