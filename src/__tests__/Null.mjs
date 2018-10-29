const test = require('tape');
import jsonComplete from '/src/main.mjs';

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
