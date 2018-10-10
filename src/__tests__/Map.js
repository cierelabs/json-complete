const test = require('tape');
const jsonComplete = require('../main.js');
const testHelpers = require('../../_tools/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Map: Normal', (t) => {
    t.plan(8);

    const source = [[1, 1], [2, 2], ['test', 'test'], [{ a: { b: 2 } }, { a: { b: 2 } }]];

    const decoded = decode(encode([new Map(source)]))[0];

    let i = 0;
    Map.prototype.forEach.call(decoded, (v, k) => {
        if (!testHelpers.isObject(v)) {
            t.equal(source[i][0], k);
            t.equal(source[i][1], v);
        }
        else {
            t.equal(source[i][0].a.b, k.a.b);
            t.equal(source[i][1].a.b, v.a.b);
        }
        i += 1;
    });
});

test('Map: Root Value', (t) => {
    t.plan(8);

    const source = [[1, 1], [2, 2], ['test', 'test'], [{ a: { b: 2 } }, { a: { b: 2 } }]];

    const decoded = decode(encode(new Map(source)));

    let i = 0;
    Map.prototype.forEach.call(decoded, (v, k) => {
        if (!testHelpers.isObject(v)) {
            t.equal(source[i][0], k);
            t.equal(source[i][1], v);
        }
        else {
            t.equal(source[i][0].a.b, k.a.b);
            t.equal(source[i][1].a.b, v.a.b);
        }
        i += 1;
    });
});

test('Map (Value): void 0', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[0, void 0]])]))[0];
    let value;
    Map.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.equal(value, void 0);
});

test('Map (Value): null', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[0, null]])]))[0];
    let value;
    Map.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.equal(value, null);
});

test('Map (Value): true', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[0, true]])]))[0];
    let value;
    Map.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.equal(value, true);
});

test('Map (Value): false', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[0, false]])]))[0];
    let value;
    Map.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.equal(value, false);
});

test('Map (Value): NaN', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[0, NaN]])]))[0];
    let value;
    Map.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.ok(testHelpers.isNanValue(value));
});

test('Map (Value): -Infinity', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[0, -Infinity]])]))[0];
    let value;
    Map.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.equal(value, -Infinity);
});

test('Map (Value): Infinity', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[0, Infinity]])]))[0];
    let value;
    Map.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.equal(value, Infinity);
});

test('Map (Value): -0', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[0, -0]])]))[0];
    let value;
    Map.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.ok(testHelpers.isNegativeZero(value));
});

test('Map (Value): Number', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[0, 1]])]))[0];
    let value;
    Map.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.equal(value, 1);
});

test('Map (Value): String', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[0, 'string']])]))[0];
    let value;
    Map.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.equal(value, 'string');
});

test('Map (Value): Regex', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[0, /\s+/g]])]))[0];
    let value;
    Map.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.ok(testHelpers.isRegex(value));
});

test('Map (Value): Date', (t) => {
    t.plan(1);
    const now = Date.now();
    const decoded = decode(encode([new Map([[0, new Date(now)]])]))[0];
    let value;
    Map.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.equal(value.getTime(), now);
});

test('Map (Value): Symbol', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[0, Symbol()]])]))[0];
    let value;
    Map.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.ok(testHelpers.isSymbol(value));
});

test('Map (Value): Function', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[0, () => { return 2; }]])]))[0];
    let value;
    Map.prototype.forEach.call(decoded, (v) => {
        value = v;
    });
    t.ok(testHelpers.isFunction(value));
});

test('Map (Value): Object Inside', (t) => {
    t.plan(2);

    const decoded = decode(encode([new Map([[0, {}]])]))[0];
    let value;
    Map.prototype.forEach.call(decoded, (v) => {
        value = v;
    });

    t.ok(testHelpers.isObject(value));
    t.equal(Object.keys(value).concat(Object.getOwnPropertySymbols(value)).length, 0);
});

test('Map (Value): Array Inside', (t) => {
    t.plan(2);

    const decoded = decode(encode([new Map([[0, []]])]))[0];
    let value;
    Map.prototype.forEach.call(decoded, (v) => {
        value = v;
    });

    t.ok(testHelpers.isArray(value));
    t.equal(value.length, 0);
});

test('Map (Value): Referencial Integrity Within and Without', (t) => {
    t.plan(2);

    const obj = {
        a: {
            b: 2,
        },
    };

    const map = new Map([[0, obj]]);
    map.obj = obj;

    const decoded = decode(encode([map]))[0];
    let value;
    Map.prototype.forEach.call(decoded, (v) => {
        value = v;
    });

    t.equal(value.a.b, decoded.obj.a.b);
    t.equal(value, decoded.obj);
});

test('Map (Key): void 0', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[void 0, 1]])]))[0];
    let key;
    Map.prototype.forEach.call(decoded, (v, k) => {
        key = k;
    });
    t.equal(key, void 0);
});

test('Map (Key): null', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[null, 1]])]))[0];
    let key;
    Map.prototype.forEach.call(decoded, (v, k) => {
        key = k;
    });
    t.equal(key, null);
});

test('Map (Key): true', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[true, 1]])]))[0];
    let key;
    Map.prototype.forEach.call(decoded, (v, k) => {
        key = k;
    });
    t.equal(key, true);
});

test('Map (Key): false', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[false, 1]])]))[0];
    let key;
    Map.prototype.forEach.call(decoded, (v, k) => {
        key = k;
    });
    t.equal(key, false);
});

test('Map (Key): NaN', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[NaN, 1]])]))[0];
    let key;
    Map.prototype.forEach.call(decoded, (v, k) => {
        key = k;
    });
    t.ok(testHelpers.isNanValue(key));
});

test('Map (Key): -Infinity', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[-Infinity, 1]])]))[0];
    let key;
    Map.prototype.forEach.call(decoded, (v, k) => {
        key = k;
    });
    t.equal(key, -Infinity);
});

test('Map (Key): Infinity', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[Infinity, 1]])]))[0];
    let key;
    Map.prototype.forEach.call(decoded, (v, k) => {
        key = k;
    });
    t.equal(key, Infinity);
});

test('Map (Key): -0 (Maps cannot use -0 as a key, only 0: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Key_equality )', (t) => {
    t.plan(2);
    const decoded = decode(encode([new Map([[-0, 1]])]))[0];
    let key;
    Map.prototype.forEach.call(decoded, (v, k) => {
        key = k;
    });
    t.notOk(testHelpers.isNegativeZero(key));
    t.equal(key, 0);
});

test('Map (Key): Number', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[1, 1]])]))[0];
    let key;
    Map.prototype.forEach.call(decoded, (v, k) => {
        key = k;
    });
    t.equal(key, 1);
});

test('Map (Key): String', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([['string', 1]])]))[0];
    let key;
    Map.prototype.forEach.call(decoded, (v, k) => {
        key = k;
    });
    t.equal(key, 'string');
});

test('Map (Key): Regex', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[/\s+/g, 1]])]))[0];
    let key;
    Map.prototype.forEach.call(decoded, (v, k) => {
        key = k;
    });
    t.ok(testHelpers.isRegex(key));
});

test('Map (Key): Date', (t) => {
    t.plan(1);
    const now = Date.now();
    const decoded = decode(encode([new Map([[new Date(now), 1]])]))[0];
    let key;
    Map.prototype.forEach.call(decoded, (v, k) => {
        key = k;
    });
    t.equal(key.getTime(), now);
});

test('Map (Key): Symbol', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[Symbol(), 1]])]))[0];
    let key;
    Map.prototype.forEach.call(decoded, (v, k) => {
        key = k;
    });
    t.ok(testHelpers.isSymbol(key));
});

test('Map (Key): Function', (t) => {
    t.plan(1);
    const decoded = decode(encode([new Map([[() => { return 2; }, 1]])]))[0];
    let key;
    Map.prototype.forEach.call(decoded, (v, k) => {
        key = k;
    });
    t.ok(testHelpers.isFunction(key));
});

test('Map (Key): Object Inside', (t) => {
    t.plan(2);

    const decoded = decode(encode([new Map([[{}, 1]])]))[0];
    let key;
    Map.prototype.forEach.call(decoded, (v, k) => {
        key = k;
    });

    t.ok(testHelpers.isObject(key));
    t.equal(Object.keys(key).concat(Object.getOwnPropertySymbols(key)).length, 0);
});

test('Map (Key): Array Inside', (t) => {
    t.plan(2);

    const decoded = decode(encode([new Map([[[], 1]])]))[0];
    let key;
    Map.prototype.forEach.call(decoded, (v, k) => {
        key = k;
    });

    t.ok(testHelpers.isArray(key));
    t.equal(key.length, 0);
});

test('Map (Key): Referencial Integrity Within and Without', (t) => {
    t.plan(2);

    const obj = {
        a: {
            b: 2,
        },
    };

    const map = new Map([[obj, 1]]);
    map.obj = obj;

    const decoded = decode(encode([map]))[0];
    let key;
    Map.prototype.forEach.call(decoded, (v, k) => {
        key = k;
    });

    t.equal(key.a.b, decoded.obj.a.b);
    t.equal(key, decoded.obj);
});

test('Map: Referencial Integrity Between Key and Value', (t) => {
    t.plan(3);

    const obj = { a: { b: 2 } };
    const source = [[obj, obj]];

    const decoded = decode(encode([new Map(source)]))[0];

    Map.prototype.forEach.call(decoded, (v, k) => {
        t.equal(k, v);
        t.notEqual(obj, k);
        t.notEqual(obj, v);
    });
});

test('Map: Arbitrary Attached Data', (t) => {
    t.plan(3);
    const map = new Map([[0, 1]]);
    map.x = 2;
    map[Symbol.for('map')] = 'test';

    const decodedMap = decode(encode([map]))[0];

    t.ok(decodedMap.has(0));
    t.equal(decodedMap.x, 2);
    t.equal(decodedMap[Symbol.for('map')], 'test');
});

test('Map: Self-Containment', (t) => {
    t.plan(2);
    const map = new Map([[0, 1]]);
    map.me = map;

    const decodedMap = decode(encode([map]))[0];

    t.ok(decodedMap.has(0));
    t.equal(decodedMap.me, decodedMap);
});
