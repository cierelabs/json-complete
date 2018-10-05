const test = require('tape');
const jsonComplete = require('../main.js');
const testHelpers = require('../../_tools/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Object: void 0', (t) => {
    t.plan(1);
    t.equal(decode(encode({ 'un': void 0 }))['un'], void 0);
});

test('Object: null', (t) => {
    t.plan(1);
    t.equal(decode(encode({ 'nl': null }))['nl'], null);
});

test('Object: true', (t) => {
    t.plan(1);
    t.equal(decode(encode({ 'bt': true }))['bt'], true);
});

test('Object: false', (t) => {
    t.plan(1);
    t.equal(decode(encode({ 'bf': false }))['bf'], false);
});

test('Object: NaN', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNanValue(decode(encode({ 'na': NaN }))['na']));
});

test('Object: -Infinity', (t) => {
    t.plan(1);
    t.equal(decode(encode({ '-i': -Infinity }))['-i'], -Infinity);
});

test('Object: Infinity', (t) => {
    t.plan(1);
    t.equal(decode(encode({ '+i': Infinity }))['+i'], Infinity);
});

test('Object: -0', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNegativeZero(decode(encode({ 'n0': -0 }))['n0']));
});

test('Object: Number', (t) => {
    t.plan(1);
    t.equal(decode(encode({ 'nm': 1 }))['nm'], 1);
});

test('Object: String', (t) => {
    t.plan(1);
    t.equal(decode(encode({ 'st': 'string' }))['st'], 'string');
});

test('Object: Regex', (t) => {
    t.plan(1);
    t.ok(testHelpers.isRegex(decode(encode({ 're': /\s+/g }))['re']));
});

test('Object: Date', (t) => {
    t.plan(1);
    const now = Date.now();
    t.equal(decode(encode({ 'da': new Date(now) }))['da'].getTime(), now);
});

test('Object: Symbol', (t) => {
    t.plan(1);
    t.ok(testHelpers.isSymbol(decode(encode({ 'sy': Symbol() }))['sy']));
});

test('Object: Function', (t) => {
    t.plan(1);
    t.ok(testHelpers.isFunction(decode(encode({ 'fu': () => { return 2; } }))['fu']));
});

test('Object: Object Inside', (t) => {
    t.plan(1);
    t.ok(testHelpers.isObject(decode(encode({ 'ob': {} }))['ob']));
});

test('Object: Array Inside', (t) => {
    t.plan(1);
    t.ok(testHelpers.isArray(decode(encode({ 'ar': [] }))['ar']));
});

test('Object: Number Key', (t) => {
    t.plan(1);
    t.equal(decode(encode({ ['0']: 1 }))['0'], 1);
});

test('Object: String Key', (t) => {
    t.plan(1);
    t.equal(decode(encode({ ['']: 2 }))[''], 2);
});

test('Object: Symbol Key', (t) => {
    t.plan(3);

    const decodedNormalSymbolObj = decode(encode({ [Symbol()]: 3 }));
    const decodedNormalSymbolKeys = Object.keys(decodedNormalSymbolObj).concat(Object.getOwnPropertySymbols(decodedNormalSymbolObj));

    t.equal(decodedNormalSymbolKeys.length, 1);
    t.ok(testHelpers.isSymbol(decodedNormalSymbolKeys[0]));
    t.equal(decodedNormalSymbolObj[decodedNormalSymbolKeys[0]], 3);
});

test('Object: Registered Symbol Key', (t) => {
    t.plan(4);

    const decodedKeyedSymbolObj = decode(encode({ [Symbol.for('keyed')]: 4 }));
    const decodedKeyedSymbolKeys = Object.keys(decodedKeyedSymbolObj).concat(Object.getOwnPropertySymbols(decodedKeyedSymbolObj));

    t.equal(decodedKeyedSymbolKeys.length, 1);
    t.ok(testHelpers.isSymbol(decodedKeyedSymbolKeys[0]));
    t.equal(Symbol.keyFor(decodedKeyedSymbolKeys[0]), 'keyed');
    t.equal(decodedKeyedSymbolObj[decodedKeyedSymbolKeys[0]], 4);
});

test('Object: Shared Symbol Key References', (t) => {
    t.plan(3);

    const sharedSymbol = Symbol('shared');
    const decodedSharedSymbolObj = decode(encode({
        [sharedSymbol]: 1,
        b: {
            [sharedSymbol]: 2,
        },
    }));
    const decodedSharedSymbolKeys = Object.getOwnPropertySymbols(decodedSharedSymbolObj);
    const decodedSharedInnerSymbolKeys = Object.getOwnPropertySymbols(decodedSharedSymbolObj.b);

    t.equal(decodedSharedSymbolKeys[0], decodedSharedInnerSymbolKeys[0]);
    t.equal(decodedSharedSymbolObj[decodedSharedSymbolKeys[0]], 1);
    t.equal(decodedSharedSymbolObj.b[decodedSharedInnerSymbolKeys[0]], 2);
});

test('Object: Nested Objects', (t) => {
    t.plan(1);

    const nestedObj = decode(encode({
        a: {
            b: {
                c: {
                    d: {
                        e: 5,
                    },
                },
            },
        },
    }));

    t.equal(nestedObj.a.b.c.d.e, 5);
});

test('Object: Circular Object References', (t) => {
    t.plan(2);

    const circular = {
        x: {
            y: {
                z: void 0,
            },
        },
    };
    circular.x.y.z = circular;
    const decodedCircularObj = decode(encode(circular));

    t.equal(decodedCircularObj, decodedCircularObj.x.y.z);
    t.equal(decodedCircularObj, decodedCircularObj.x.y.z.x.y.z);
});
