const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof Blob === 'function') {
    test('Deferred Type Attached To Deferred Type: Works', (t) => {
        t.plan(3);

        const obj1 = { a: 1 };
        const obj2 = { b: 2 };
        const blob1 = new Blob([JSON.stringify(obj1)], { type: 'application/json' });
        const blob2 = new Blob([JSON.stringify(obj2)], { type: 'application/json' });
        blob1.blob2 = blob2;

        encode(blob1, {
            onFinish: (encoded) => {
                const decodedBlob1 = decode(encoded);

                const reader = new FileReader();
                reader.addEventListener('loadend', () => {
                    t.deepEqual(JSON.parse(reader.result), obj2);
                });
                reader.readAsText(decodedBlob1.blob2);

                t.equal(testHelpers.systemName(decodedBlob1.blob2), '[object Blob]');
                t.equal(decodedBlob1.type, 'application/json');
            },
        });
    });
}
else {
    console.log('Tests for Deferred Type Attached To Deferred Type skipped because Blob type is not supported in the current environment.'); // eslint-disable-line no-console
}