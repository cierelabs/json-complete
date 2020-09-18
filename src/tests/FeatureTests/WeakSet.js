import test from '/tests/tape.js';
import jsonComplete from '/main.js';
import StandardObjectTests from '/tests/StandardObjectTests.js';
import testHelpers from '/tests/testHelpers.js';

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

// WeakSet is not fully supported because its internal data is not iterable, and therefore cannot be serialized.
// Attempting to encode WeakSets will create several logs and store the value as a plain, empty Object.
// However, like any Object, WeakSets can store arbitrary data via String or Symbol keys.

if (typeof WeakSet === 'function') {
    test('WeakSet: Not Supported', (t) => {
        t.plan(2);

        const source = [{ a: { b: 2 } }];

        const decoded = decode(encode([new WeakSet(source)], {
            compat: true,
        }))[0];

        t.ok(testHelpers.isObject(decoded));
        t.equal(decoded.has, void 0);
    });

    StandardObjectTests('WeakSet', 'Object', () => {
        return new WeakSet([{ a: { b: 2 } }]);
    }, true);
}
else {
    console.log('Tests for WeakSet type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
