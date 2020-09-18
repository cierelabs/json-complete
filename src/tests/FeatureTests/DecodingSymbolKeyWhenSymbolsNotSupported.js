import test from '/tests/tape.js';
import testHelpers from '/tests/testHelpers.js';
import jsonComplete from '/main.js';

const decode = jsonComplete.decode;

if (typeof Symbol === 'function') {
    // encode({
    //     k: 2,
    //     [Symbol.for('s')]: 1,
    // }, {
    //     encodeSymbolKeys: true,
    // });
    const encodedSymbolKeyObject = '["O0,2",["O","S0P0 N0N1"],["S",["k"]],["P",["rs"]],["N","b;"]]';

    test('Decoding Symbol Key when Symbols are Not Supported: Defaults to throw', (t) => {
        t.plan(2);

        const globalThis = testHelpers.getGlobal();

        const oldSymbol = globalThis.Symbol;

        globalThis.Symbol = void 0;

        try {
            decode(encodedSymbolKeyObject, {
                compat: false
            });
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

        globalThis.Symbol = void 0;

        try {
            const decoded = decode(encodedSymbolKeyObject, {
                compat: true,
            });

            // Tape now relies on Symbol existing in globalThis, so restore it early here
            globalThis.Symbol = oldSymbol;

            t.deepEqual(decoded, {k: 2});
        } catch (e) {
            t.ok(false);
            throw e;
        }

        globalThis.Symbol = oldSymbol;

        t.ok(true);
    });
}
