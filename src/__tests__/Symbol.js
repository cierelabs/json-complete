const test = require('tape');
const jsonComplete = require('../main.js');
const testHelpers = require('../../_tools/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Symbol: Normal', (t) => {
    t.plan(1);
    t.ok(testHelpers.isSymbol(decode(encode([Symbol()]))[0]));
});

test('Symbol: Retained Identifier', (t) => {
    t.plan(3);
    const originalSymbol = Symbol('myId');
    const decodedSymbol = decode(encode([originalSymbol]))[0];

    t.notEqual(decodedSymbol, originalSymbol);
    t.equal(Symbol.keyFor(decodedSymbol), void 0);
    t.equal(String(decodedSymbol), 'Symbol(myId)');
});

test('Symbol: Registered Symbols', (t) => {
    t.plan(2);
    t.equal(decode(encode([Symbol.for('symbol 1')]))[0], Symbol.for('symbol 1'));
    t.equal(Symbol.keyFor(decode(encode([Symbol.for('symbol 1')]))[0]), 'symbol 1');
});

test('Symbol: Referenced Symbols Not Equal To Pre-Encoded Symbol', (t) => {
    t.plan(1);
    const symbolItem = Symbol('symbol 2');
    t.notEqual(decode(encode([symbolItem]))[0], symbolItem);
});

test('Symbol: Root Value Normal', (t) => {
    t.plan(1);
    t.ok(testHelpers.isSymbol(decode(encode(Symbol()))));
});

test('Symbol: Root Value Registered Symbol', (t) => {
    t.plan(1);
    t.equal(decode(encode(Symbol.for('x'))), Symbol.for('x'));
});

test('Symbol: Referencial Integrity', (t) => {
    t.plan(2);

    const source = Symbol();

    const decoded = decode(encode({
        x: source,
        y: source,
    }));

    t.equal(decoded.x, decoded.y);
    t.notEqual(decoded.x, source);
});
