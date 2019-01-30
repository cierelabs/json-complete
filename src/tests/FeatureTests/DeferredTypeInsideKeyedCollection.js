const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof Blob === 'function' && typeof Map === 'function') {
    test('Deferred Types Inside Keyed Collection: Works', (t) => {
        t.plan(3);

        const obj = { a: 1 };
        const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
        const source = new Map();
        source.set(1, blob);

        encode(source, {
            onFinish: (encoded) => {
                const decoded = decode(encoded);
                const blob = decoded.get(1);

                const reader = new FileReader();
                reader.addEventListener('loadend', () => {
                    t.deepEqual(JSON.parse(reader.result), obj);
                });
                reader.readAsText(blob);

                t.equal(testHelpers.systemName(blob), '[object Blob]');
                t.equal(blob.type, 'application/json');
            },
        });
    });
}
else {
    console.warn('Tests for Deferred Types Inside Keyed Collection skipped because both Blob and Map are not supported in the current environment.'); // eslint-disable-line no-console
}