const test = require('tape');
const jsonComplete = require('/main.js');

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
