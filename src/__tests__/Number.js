const test = require('tape');
const jsonComplete = require('../main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Number: 1', (t) => {
    t.plan(1);
    t.equal(decode(encode([1]))[0], 1);
});

test('Number: 0', (t) => {
    t.plan(1);
    t.equal(decode(encode([0]))[0], 0);
});

test('Number: -1', (t) => {
    t.plan(1);
    t.equal(decode(encode([-1]))[0], -1);
});

test('Number: 3.14', (t) => {
    t.plan(1);
    t.equal(decode(encode([3.14]))[0], 3.14);
});
