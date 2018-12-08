const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const decode = jsonComplete.decode;

const encodedSymbolKeyObject = '[["Ob",[[["St0","Sy0"],["St1","St2"]]]],["St",["k","2","1"]],["Sy",["Rs"]],["r","Ob0"],["v","1.0.0"]]';

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
        t.equal(e.message, 'Cannot decode recognized pointer type "Sy".');
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
        t.deepEqual(decoded, {k: '2'});
    } catch (e) {
        t.ok(false);
        throw e;
    }

    globalThis.Symbol = oldSymbol;

    t.ok(true);
});