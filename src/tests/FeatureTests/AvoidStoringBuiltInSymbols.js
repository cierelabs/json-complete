const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

const genArgs = function() {
    return arguments;
};

if (typeof Symbol === 'function') {
    test('Avoid Storing Built-In Symbols: Ensure that we are not encoding Symbol-defined Symbols attached to Objects', (t) => {
        t.plan(8);

        const values = [
            [
                Symbol(),
                'unique',
            ],
            [
                Symbol('id'),
                'identifier',
            ],
            [
                Symbol.for('registered'),
                'registered',
            ],
            [
                Symbol('Symbol.test'),
                'built-in-like',
            ],
            [
                Symbol('Symbol.toStringTag'),
                'built-in that does not exist on Arguments',
            ],
        ];

        const args = genArgs(1);
        values.forEach((item) => {
            args[item[0]] = item[1];
        });

        const encoded = encode(args, {
            encodeSymbolKeys: true,
        });

        JSON.parse(encoded).slice(2).forEach((types) => {
            if (types[0] === 'Q') {
                t.equal(types[1].split(' ')[1].length, 10);
                t.equal(types[1].split(' ')[2].length, 10);
            }
        });

        const decoded = decode(encoded);

        t.equal(testHelpers.systemName(decoded), '[object Arguments]');

        const symbols = Object.getOwnPropertySymbols(decoded);
        let index = 0;
        symbols.forEach((symbol) => {
            if (String(symbol) !== 'Symbol(Symbol.iterator)') {
                t.equal(decoded[symbol], values[index][1]);
                index += 1;
            }
        });
    });

    test('Avoid Storing Built-In Symbols: Encoding a Symbol that has the same identifier is still encoded, without affecting the built-in attached Symbol', (t) => {
        t.plan(8);

        const args = genArgs();
        args[Symbol('Symbol.iterator')] = 'overriding';

        const encoded = encode(args, {
            encodeSymbolKeys: true,
        });

        JSON.parse(encoded).slice(2).forEach((types) => {
            if (types[0] === 'Q') {
                t.equal(types[1].split(' ')[1].length, 2);
                t.equal(types[1].split(' ')[2].length, 2);
            }
        });

        const decoded = decode(encoded);

        t.equal(testHelpers.systemName(decoded), '[object Arguments]');

        const symbols = Object.getOwnPropertySymbols(decoded);

        t.equal(symbols.length, 2);
        t.notEqual(symbols[0], symbols[1]);
        t.equal(String(symbols[0]), String(symbols[1]));

        const isFirstBuiltIn = symbols[0] === Symbol.iterator;
        const builtInIndex = isFirstBuiltIn ? 0 : 1;
        const customIndex = isFirstBuiltIn ? 1 : 0;

        t.ok(testHelpers.isFunction(decoded[symbols[builtInIndex]]));
        t.equal(decoded[symbols[customIndex]], 'overriding');
    });
}
else {
    console.warn('Tests for Built-In Symbols skipped because they are not supported in the current environment.'); // eslint-disable-line no-console
}
