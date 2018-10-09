const test = require('tape');
const jsonComplete = require('../main.js');
const testHelpers = require('../../_tools/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Set: void 0', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Set([void 0])]))[0];
    let value;
    Set.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.equal(value, void 0);
});

test('Set: null', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Set([null])]))[0];
    let value;
    Set.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.equal(value, null);
});

test('Set: true', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Set([true])]))[0];
    let value;
    Set.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.equal(value, true);
});

test('Set: false', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Set([false])]))[0];
    let value;
    Set.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.equal(value, false);
});

test('Set: NaN', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Set([NaN])]))[0];
    let value;
    Set.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.ok(testHelpers.isNanValue(value));
});

test('Set: -Infinity', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Set([-Infinity])]))[0];
    let value;
    Set.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.equal(value, -Infinity);
});

test('Set: Infinity', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Set([Infinity])]))[0];
    let value;
    Set.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.equal(value, Infinity);
});

test('Set: -0 (Sets do not store -0, only 0: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set )', (t) => {
    t.plan(2);
    const decoded = decode(encode([new Set([-0])]))[0];
    let value;
    Set.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    console.log(encode([new Set([-0])]))
    t.notOk(testHelpers.isNegativeZero(value));
    t.equal(value, 0);
});

test('Set: Number', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Set([1])]))[0];
    let value;
    Set.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.equal(value, 1);
});

test('Set: String', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Set(['string'])]))[0];
    let value;
    Set.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.equal(value, 'string');
});

test('Set: Regex', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Set([/\s+/g])]))[0];
    let value;
    Set.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.ok(testHelpers.isRegex(value));
});

test('Set: Date', (t) => {
    t.plan(1);
    const now = Date.now();
    const decoded = decode(encode([new Set([new Date(now)])]))[0];
    let value;
    Set.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.equal(value.getTime(), now);
});

test('Set: Symbol', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Set([Symbol()])]))[0];
    let value;
    Set.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.ok(testHelpers.isSymbol(value));
});

test('Set: Function', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Set([() => { return 2; }])]))[0];
    let value;
    Set.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.ok(testHelpers.isFunction(value));
});

test('Set: Object Inside', (t) => {
    t.plan(2);

    const decoded = decode(encode([new Set([{}])]))[0];
    let value;
    Set.prototype.forEach.call(decoded, (v) => {
        value = v;
    });

    t.ok(testHelpers.isObject(value));
    t.equal(Object.keys(value).concat(Object.getOwnPropertySymbols(value)).length, 0);
});

test('Set: Array Inside', (t) => {
    t.plan(2);

    const decoded = decode(encode([new Set([[]])]))[0];
    let value;
    Set.prototype.forEach.call(decoded, (v) => {
        value = v;
    });

    t.ok(testHelpers.isArray(value));
    t.equal(value.length, 0);
});

test('Set: Referencial Integrety Within and Without', (t) => {
    t.plan(2);

    const obj = {
        a: {
            b: 2,
        },
    };

    const set = new Set([obj]);
    set.obj = obj;

    const decoded = decode(encode([set]))[0];
    let value;
    Set.prototype.forEach.call(decoded, (v) => {
        value = v;
    });

    t.equal(value.a.b, decoded.obj.a.b);
    t.equal(value, decoded.obj);
});

test('Set: Arbitrary Attached Data', (t) => {
    t.plan(3);
    const set = new Set([1]);
    set.x = 2;
    set[Symbol.for('set')] = 'test';

    const decodedSet = decode(encode([set]))[0];

    t.ok(decodedSet.has(1));
    t.equal(decodedSet.x, 2);
    t.equal(decodedSet[Symbol.for('set')], 'test');
});

test('Set: Self-Containment', (t) => {
    t.plan(2);
    const set = new Set([1]);
    set.me = set;

    const decodedSet = decode(encode([set]))[0];

    t.ok(decodedSet.has(1));
    t.equal(decodedSet.me, decodedSet);
});
