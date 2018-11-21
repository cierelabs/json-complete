const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

// WeakMap is not fully supported because its internal data is not iterable, and therefore cannot be serialized.
// Attempting to encode WeakMaps will create several logs and store the value as a plain, empty Object.
// However, like any Object, WeakMaps can store arbitrary data via String or Symbol keys.

if (typeof WeakMap === 'function') {
    test('WeakMap: Not Supported', (t) => {
        t.plan(2);

        const source = [[{ a: { b: 2 } }, { a: { b: 2 } }]];

        const decoded = decode(encode([new WeakMap(source)], {
            safeMode: true,
        }))[0];

        t.ok(testHelpers.isObject(decoded));
        t.equal(decoded.has, void 0);
    });

    test('WeakMap: Arbitrary Attached Data', (t) => {
        t.plan(3);

        const weakMap = new WeakMap([[{ a: { b: 2 } }, { a: { b: 2 } }]]);
        weakMap.x = 2;
        weakMap[Symbol.for('weakMap')] = 'test';

        const decodedWeakMap = decode(encode([weakMap], {
            safeMode: true,
            encodeSymbolKeys: true,
        }))[0];

        t.ok(testHelpers.isObject(decodedWeakMap));
        t.equal(decodedWeakMap.x, 2);
        t.equal(decodedWeakMap[Symbol.for('weakMap')], 'test');
    });

    test('WeakMap: Self-Containment', (t) => {
        t.plan(2);

        const weakMap = new WeakMap([[{ a: { b: 2 } }, { a: { b: 2 } }]]);
        weakMap.me = weakMap;

        const decodedWeakMap = decode(encode([weakMap], {
            safeMode: true,
        }))[0];

        t.ok(testHelpers.isObject(decodedWeakMap));
        t.equal(decodedWeakMap.me, decodedWeakMap);
    });

    test('WeakMap: Referencial Integrity', (t) => {
        t.plan(2);

        const source = new WeakMap([[{ a: 1 }, { b: 2 }]]);

        const decoded = decode(encode({
            x: source,
            y: source,
        }, {
            safeMode: true,
        }));

        t.equal(decoded.x, decoded.y);
        t.notEqual(decoded.x, source);
    });
}
else {
    console.warn('Tests for WeakMap type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
