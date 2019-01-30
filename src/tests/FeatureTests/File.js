const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

const supportsFileCreation = () => {
    try {
        const file = new File([''], 'empty.txt', {
            type: 'text/plain',
        });

        return testHelpers.systemName(file) === '[object File]';
    } catch (e) {
        return false;
    }
};

if (typeof File === 'function' && supportsFileCreation()) {
    test('File: Normal', (t) => {
        t.plan(5);

        const now = Date.now() + 1000;

        const obj = { a: 1 };
        const blob = new Blob([JSON.stringify(obj)]);
        const file = new File([blob], 'test.json', {
            type: 'application/json',
            lastModified: now,
        });

        encode([file], {
            onFinish: (encoded) => {
                const decoded = decode(encoded)[0];

                const reader = new FileReader();
                reader.addEventListener('loadend', function() {
                    t.deepEqual(JSON.parse(reader.result), obj);
                });
                reader.readAsText(decoded);

                t.equal(testHelpers.systemName(decoded), '[object File]');
                t.equal(decoded.name, 'test.json');
                t.equal(decoded.type, 'application/json');
                t.equal(decoded.lastModified, now);
            },
        });
    });

    test('File: Empty Name', (t) => {
        t.plan(2);

        const obj = { a: 1 };
        const blob = new Blob([JSON.stringify(obj)]);
        const file = new File([blob], '');

        encode([file], {
            onFinish: (encoded) => {
                const decoded = decode(encoded)[0];

                t.equal(testHelpers.systemName(decoded), '[object File]');
                t.equal(decoded.name, '');
            },
        });
    });

    test('File: Empty Type', (t) => {
        t.plan(2);

        const obj = { a: 1 };
        const blob = new Blob([JSON.stringify(obj)]);
        const file = new File([blob], 'test.json');

        encode([file], {
            onFinish: (encoded) => {
                const decoded = decode(encoded)[0];

                t.equal(testHelpers.systemName(decoded), '[object File]');
                t.equal(decoded.type, '');
            },
        });
    });

    test('File: Empty Last Modified', (t) => {
        t.plan(2);

        const obj = { a: 1 };
        const blob = new Blob([JSON.stringify(obj)]);
        const file = new File([blob], 'test.json');

        const lastModified = file.lastModified;

        encode([file], {
            onFinish: (encoded) => {
                const decoded = decode(encoded)[0];

                t.equal(testHelpers.systemName(decoded), '[object File]');
                t.equal(decoded.lastModified, lastModified);
            },
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

        encode(file, {
            onFinish: (encoded) => {
                const decoded = decode(encoded);

                const reader = new FileReader();
                reader.addEventListener('loadend', function() {
                    t.deepEqual(JSON.parse(reader.result), obj);
                });
                reader.readAsText(decoded);

                t.equal(testHelpers.systemName(decoded), '[object File]');
                t.equal(decoded.name, 'test.json');
                t.equal(decoded.type, 'application/json');
                t.equal(decoded.lastModified, now);
            },
        });
    });

    test('Blob: Missing onFinish Option', (t) => {
        t.plan(1);

        const now = Date.now() + 1000;

        const obj = { a: 1 };
        const blob = new Blob([JSON.stringify(obj)]);
        const file = new File([blob], 'test.json', {
            type: 'application/json',
            lastModified: now,
        });

        try {
            encode([file]);
            t.ok(false);
        } catch (e) {
            t.equal(e.message, 'Deferred Types require onFinish option.');
        }
    });

    StandardObjectTests('File', 'File', () => {
        const obj = { a: 1 };
        const blob = new Blob([JSON.stringify(obj)]);
        return new File([blob], 'test.json');
    });

    test('File: Encoding Expected', (t) => {
        t.plan(1);

        const now = Date.now();

        const blob = new Blob([JSON.stringify(1)], { type: 'application/json' });
        const file = new File([blob], 'test.json', {
            type: 'application/json',
            lastModified: now,
        });
        file.a = false;

        encode(file, {
            onFinish: (encoded) => {
                t.deepEqual(testHelpers.simplifyEncoded(encoded), {
                    Z: '$0S0S1N0 S2 F0',
                    S: [
                        'application/json',
                        'test.json',
                        'a',
                    ],
                    $: 'N1',
                    N: `${String(now)},49`,
                    r: 'Z0',
                });
            },
        });
    });
}
else {
    console.warn('Tests for File type skipped because the File type or the File Constructor is not supported in the current environment.'); // eslint-disable-line no-console
}
