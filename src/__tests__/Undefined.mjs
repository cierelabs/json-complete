const test = require('tape');
import jsonComplete from '/src/main.mjs';

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
