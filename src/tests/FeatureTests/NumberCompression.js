import test from '/tests/tape.js';
import jsonComplete from '/main.js';

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Number Compression: Normal Numbers', (t) => {
    t.plan(1);

    const numbers = [];
    for (let n = 0; n < 200; n += 1) {
        numbers.push(n);
    }

    t.deepEqual(decode(encode(numbers)), numbers);
});

test('Number Compression: Deduplication', (t) => {
    t.plan(1);

    t.deepEqual(decode(encode([1, 1, 11, 11])), [1, 1, 11, 11]);
});

test('Number Compression: End Buffer Handling', (t) => {
    t.plan(6);

    t.equal(decode(encode(1)), 1);
    t.equal(decode(encode(11)), 11);
    t.equal(decode(encode(111)), 111);
    t.equal(decode(encode(1111)), 1111);
    t.equal(decode(encode(11111)), 11111);
    t.equal(decode(encode(111111)), 111111);
});

test('Number Compression: Non-Digits', (t) => {
    t.plan(9);

    t.equal(decode(encode(.3)), 0.3);
    t.equal(decode(encode(-3)), -3);
    t.equal(decode(encode(3.)), 3);
    t.equal(decode(encode(.3e3)), 0.3e3);
    t.equal(decode(encode(.3e+3)), 0.3e3);
    t.equal(decode(encode(.3e-3)), .3e-3);
    t.equal(decode(encode(-.3e3)), -0.3e3);
    t.equal(decode(encode(.3E3)), 0.3e3);
    t.deepEqual(decode(encode([.3, -.3, 3, .3e3, .3e+3, .3e-3, -.3e+3])), [0.3, -0.3, 3, 0.3e3, 0.3e3, 0.3e-3, -0.3e3]);
});

test('Number Compression: Object Wrapped Number', (t) => {
    t.plan(4);

    const input = [
        new Number(1),
        new Number(2),
    ];

    const decoded = decode(encode(input));

    t.equal(typeof decoded[0], 'object');
    t.equal(decoded[0].valueOf(), 1);

    t.equal(typeof decoded[1], 'object');
    t.equal(decoded[1].valueOf(), 2);
});

if (typeof BigInt === 'function') {
    test('Number Compression: BigInt', (t) => {
        t.plan(1);
        const input = [BigInt(100), BigInt(100)];
        t.deepEqual(decode(encode(input)), input);
    });
}
else {
    console.log('Tests for Number Compression on BigInt type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
