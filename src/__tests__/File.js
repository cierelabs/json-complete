const test = require('tape');
const jsonComplete = require('../main.js');
const testHelpers = require('../../_tools/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

// Node does not natively support Files, so only run these tests in the Browser
if (testHelpers.isInBrowser()) {
    test('File: Normal', (t) => {
        t.plan(5);

        const now = Date.now() + 1000;

        const obj = { a: 1 };
        const blob = new Blob([JSON.stringify(obj)]);
        const file = new File([blob], 'test.json', {
            type: 'application/json',
            lastModified: now,
        });

        encode([file], (encoded) => {
            const decoded = decode(encoded)[0];

            var reader = new FileReader();
            reader.addEventListener('loadend', function() {
                t.deepEqual(JSON.parse(reader.result), obj);
            });
            reader.readAsText(decoded);

            t.equal(testHelpers.systemName(decoded), '[object File]');
            t.equal(decoded.name, 'test.json');
            t.equal(decoded.type, 'application/json');
            t.equal(decoded.lastModified, now);
        });
    });

    test('File: Empty Name', (t) => {
        t.plan(2);

        const obj = { a: 1 };
        const blob = new Blob([JSON.stringify(obj)]);
        const file = new File([blob], '');

        encode([file], (encoded) => {
            const decoded = decode(encoded)[0];

            t.equal(testHelpers.systemName(decoded), '[object File]');
            t.equal(decoded.name, '');
        });
    });

    test('File: Empty Type', (t) => {
        t.plan(2);

        const obj = { a: 1 };
        const blob = new Blob([JSON.stringify(obj)]);
        const file = new File([blob], 'test.json');

        encode([file], (encoded) => {
            const decoded = decode(encoded)[0];

            t.equal(testHelpers.systemName(decoded), '[object File]');
            t.equal(decoded.type, '');
        });
    });

    test('File: Empty Last Modified', (t) => {
        t.plan(2);

        const obj = { a: 1 };
        const blob = new Blob([JSON.stringify(obj)]);
        const file = new File([blob], 'test.json');

        const lastModified = file.lastModified;

        encode([file], (encoded) => {
            const decoded = decode(encoded)[0];

            t.equal(testHelpers.systemName(decoded), '[object File]');
            t.equal(decoded.lastModified, lastModified);
        });
    });

    test('File: Root Value', (t) => {
        t.plan(5);

        const now = Date.now() + 1000;

        const obj = { a: 1 };
        const blob = new Blob([JSON.stringify(obj)]);
        const file = new File([blob], 'test.json', {
            type: 'application/json',
            lastModified: now,
        });

        encode(file, (encoded) => {
            const decoded = decode(encoded);

            var reader = new FileReader();
            reader.addEventListener('loadend', function() {
                t.deepEqual(JSON.parse(reader.result), obj);
            });
            reader.readAsText(decoded);

            t.equal(testHelpers.systemName(decoded), '[object File]');
            t.equal(decoded.name, 'test.json');
            t.equal(decoded.type, 'application/json');
            t.equal(decoded.lastModified, now);
        });
    });

    test('File: Arbitrary Attached Data', (t) => {
        t.plan(3);

        const obj = { a: 1 };
        const blob = new Blob([JSON.stringify(obj)]);
        const file = new File([blob], 'test.json');
        file.x = 2;
        file[Symbol.for('File')] = 'test';

        encode([file], (encoded) => {
            const decoded = decode(encoded)[0];

            t.equal(testHelpers.systemName(decoded), '[object File]');
            t.equal(decoded.x, 2);
            t.equal(decoded[Symbol.for('File')], 'test');
        });
    });

    test('File: Self-Containment', (t) => {
        t.plan(1);

        const obj = { a: 1 };
        const blob = new Blob([JSON.stringify(obj)]);
        const file = new File([blob], 'test.json');
        file.me = file;

        encode([file], (encoded) => {
            const decoded = decode(encoded)[0];

            t.equal(decoded.me, decoded);
        });
    });

    test('File: Referencial Integrity', (t) => {
        t.plan(2);

        const obj = { a: 1 };
        const blob = new Blob([JSON.stringify(obj)]);
        const file = new File([blob], 'test.json');

        encode({
            x: file,
            y: file,
        }, (encoded) => {
            const decoded = decode(encoded);

            t.equal(decoded.x, decoded.y);
            t.notEqual(decoded.x, file);
        });
    });
}
