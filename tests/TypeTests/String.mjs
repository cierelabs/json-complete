const test = require('tape');
import jsonComplete from '/src/main.mjs';

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
