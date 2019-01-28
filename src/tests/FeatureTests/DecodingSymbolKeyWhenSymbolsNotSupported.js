const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const decode = jsonComplete.decode;

if (typeof Symbol === 'function') {
    // encode({
    //     k: 2,
    //     [Symbol.for('s')]: 1,
    // }, {
    //     encodeSymbolKeys: true,
    // });
    const encodedSymbolKeyObject = '[["O",[[["S0","P0"],["N0","N1"]]]],["S",["k"]],["P",["rs"]],["N",["2","1"]],["r","O0"],["v","1.0.0"]]';

    test('Decoding Symbol Key when Symbols are Not Supported: Defaults to throw', (t) => {
        t.plan(2);

        const globalThis = testHelpers.getGlobal();

        const oldSymbol = globalThis.Symbol;

        globalThis.Symbol = {};

        try {
            const decoded = decode(encodedSymbolKeyObject, {
                compat: false,
            });
            console.log(decoded); // eslint-disable-line no-console
            t.ok(false);
        } catch (e) {
            t.equal(e.message, 'Cannot decode recognized pointer type "P".');
        }

        globalThis.Symbol = oldSymbol;

        t.ok(true);
    });

    test('Decoding Symbol Key when Symbols are Not Supported: Skips Symbol Keys in compat mode', (t) => {
        t.plan(2);

        const globalThis = testHelpers.getGlobal();

        const oldSymbol = globalThis.Symbol;

        globalThis.Symbol = {};

        try {
            const decoded = decode(encodedSymbolKeyObject, {
                compat: true,
            });
            t.deepEqual(decoded, {k: 2});
        } catch (e) {
            t.ok(false);
            throw e;
        }

        globalThis.Symbol = oldSymbol;

        t.ok(true);
    });
}
