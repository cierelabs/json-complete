const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

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
            compat: true,
        }))[0];

        t.ok(testHelpers.isObject(decoded));
        t.equal(decoded.has, void 0);
    });

    StandardObjectTests('WeakMap', 'Object', () => {
        return new WeakMap([[{ a: { b: 2 } }, { a: { b: 2 } }]]);
    }, true);
}
else {
    console.warn('Tests for WeakMap type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
