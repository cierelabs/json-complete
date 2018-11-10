const test = require('tape');
const testHelpers = require('../../tests/testHelpers.js');
const jsonComplete = require('../../main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

const genArgs = function() {
    return arguments;
};

test('Avoid Storing Built-In Symbols: Ensure that we are not encoding Symbol-defined Symbols attached to Objects', (t) => {
    t.plan(7);

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

    const encoded = encode(args);

    encoded.forEach((types) => {
        if (types[0] === 'ag') {
            const encodedSymbolCount = types[1][0].reduce((accumulator, item) => {
                if (item.length === 2) {
                    accumulator += 1;
                }
                return accumulator;
            }, 0);

            t.equal(encodedSymbolCount, 5);
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
    t.plan(7);

    const args = genArgs();
    args[Symbol('Symbol.iterator')] = 'overriding';

    const encoded = encode(args);

    encoded.forEach((types) => {
        if (types[0] === 'ag') {
            const encodedSymbolCount = types[1][0].reduce((accumulator, item) => {
                if (item.length === 2) {
                    accumulator += 1;
                }
                return accumulator;
            }, 0);

            t.equal(encodedSymbolCount, 1);
        }
    });

    const decoded = decode(encoded);

    t.equal(testHelpers.systemName(decoded), '[object Arguments]');

    const symbols = Object.getOwnPropertySymbols(decoded);

    t.equal(symbols.length, 2);
    t.notEqual(symbols[0], symbols[1]);
    t.equal(String(symbols[0]), String(symbols[1]));
    t.ok(testHelpers.isFunction(decoded[symbols[0]]));
    t.equal(decoded[symbols[1]], 'overriding');
});
