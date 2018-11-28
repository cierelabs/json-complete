const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof Symbol === 'function') {
    test('Object Symbol Keys: Normal', (t) => {
        t.plan(3);

        const decodedNormalSymbolObj = decode(encode({ [Symbol()]: 3 }, {
            encodeSymbolKeys: true,
        }));
        const decodedNormalSymbolKeys = Object.keys(decodedNormalSymbolObj).concat(Object.getOwnPropertySymbols(decodedNormalSymbolObj));

        t.equal(decodedNormalSymbolKeys.length, 1);
        t.ok(testHelpers.isSymbol(decodedNormalSymbolKeys[0]));
        t.equal(decodedNormalSymbolObj[decodedNormalSymbolKeys[0]], 3);
    });

    test('Object Symbol Keys: Registered Symbol Key', (t) => {
        t.plan(4);

        const decodedKeyedSymbolObj = decode(encode({ [Symbol.for('keyed')]: 4 }, {
            encodeSymbolKeys: true,
        }));
        const decodedKeyedSymbolKeys = Object.keys(decodedKeyedSymbolObj).concat(Object.getOwnPropertySymbols(decodedKeyedSymbolObj));

        t.equal(decodedKeyedSymbolKeys.length, 1);
        t.ok(testHelpers.isSymbol(decodedKeyedSymbolKeys[0]));
        t.equal(Symbol.keyFor(decodedKeyedSymbolKeys[0]), 'keyed');
        t.equal(decodedKeyedSymbolObj[decodedKeyedSymbolKeys[0]], 4);
    });

    test('Object Symbol Keys: Shared Symbol Key References', (t) => {
        t.plan(3);

        const sharedSymbol = Symbol('shared');
        const decodedSharedSymbolObj = decode(encode({
            [sharedSymbol]: 1,
            b: {
                [sharedSymbol]: 2,
            },
        }, {
            encodeSymbolKeys: true,
        }));
        const decodedSharedSymbolKeys = Object.getOwnPropertySymbols(decodedSharedSymbolObj);
        const decodedSharedInnerSymbolKeys = Object.getOwnPropertySymbols(decodedSharedSymbolObj.b);

        t.equal(decodedSharedSymbolKeys[0], decodedSharedInnerSymbolKeys[0]);
        t.equal(decodedSharedSymbolObj[decodedSharedSymbolKeys[0]], 1);
        t.equal(decodedSharedSymbolObj.b[decodedSharedInnerSymbolKeys[0]], 2);
    });

    test('Object Symbol Keys: Shared Symbol Key and Value References', (t) => {
        t.plan(1);

        const sharedSymbol = Symbol('shared');
        const decodedSharedSymbolObj = decode(encode({
            [sharedSymbol]: sharedSymbol,
        }, {
            encodeSymbolKeys: true,
        }));

        const decodedSharedSymbolKeys = Object.getOwnPropertySymbols(decodedSharedSymbolObj);

        t.equal(decodedSharedSymbolKeys[0], decodedSharedSymbolObj[decodedSharedSymbolKeys[0]]);
    });
}
else {
    console.warn('Tests for Object Symbol Keys skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
