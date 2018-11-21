const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof Symbol === 'function') {
    test('Option Encode Storing Symbol Keys: Default Option Does Not Store Symbol Keys', (t) => {
        t.plan(4);

        const arr = [Symbol.for('x')];
        arr.x = Symbol.for('y');
        arr[Symbol.for('z')] = 3;

        const decoded = decode(encode(arr, {
            encodeSymbolKeys: false,
        }));

        t.ok(testHelpers.isArray(decoded));
        t.equal(decoded[0], Symbol.for('x'));
        t.equal(decoded.x, Symbol.for('y'));
        t.equal(Object.getOwnPropertySymbols(decoded).length, 0);
    });

    test('Option Encode Storing Symbol Keys: True Option Does Store Symbol Keys', (t) => {
        t.plan(6);

        const arr = [Symbol.for('x')];
        arr.x = Symbol.for('y');
        arr[Symbol.for('z')] = 3;

        const decoded = decode(encode(arr, {
            encodeSymbolKeys: true,
        }));

        t.ok(testHelpers.isArray(decoded));
        t.equal(decoded[0], Symbol.for('x'));
        t.equal(decoded.x, Symbol.for('y'));
        t.equal(Object.getOwnPropertySymbols(decoded).length, 1);
        t.equal(Object.getOwnPropertySymbols(decoded)[0], Symbol.for('z'));
        t.equal(decoded[Symbol.for('z')], 3);
    });
}