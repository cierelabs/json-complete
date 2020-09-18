import test from '/tests/tape.js';
import testHelpers from '/tests/testHelpers.js';
import jsonComplete from '/main.js';

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

const genArgs = function() {
    return arguments;
};

if (typeof Symbol === 'function') {
    test('Symbol Values of Built-In Symbols: Limitation of storing such Symbols results in the Symbol being restored as a string-based Symbol', (t) => {
        t.plan(3);

        const args = genArgs();
        const builtInIteratorSymbol = Object.getOwnPropertySymbols(args)[0];

        const decodedSymbol = decode(encode([builtInIteratorSymbol]))[0];

        t.ok(testHelpers.isSymbol(decodedSymbol));
        t.equal(String(decodedSymbol), 'Symbol(Symbol.iterator)');
        t.notEqual(decodedSymbol, builtInIteratorSymbol);
    });
}
else {
    console.log('Tests for Symbol Values of Built-In Symbols type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
