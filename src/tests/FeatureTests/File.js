const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

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

    test('File: Arbitrary Attached Data', (t) => {
        t.plan(3);

        const obj = { a: 1 };
        const blob = new Blob([JSON.stringify(obj)]);
        const file = new File([blob], 'test.json');
        file.x = 2;
        file[Symbol.for('File')] = 'test';

        encode([file], {
            encodeSymbolKeys: true,
            onFinish: (encoded) => {
                const decoded = decode(encoded)[0];

                t.equal(testHelpers.systemName(decoded), '[object File]');
                t.equal(decoded.x, 2);
                t.equal(decoded[Symbol.for('File')], 'test');
            },
        });
    });

    test('File: Self-Containment', (t) => {
        t.plan(1);

        const obj = { a: 1 };
        const blob = new Blob([JSON.stringify(obj)]);
        const file = new File([blob], 'test.json');
        file.me = file;

        encode([file], {
            onFinish: (encoded) => {
                const decoded = decode(encoded)[0];

                t.equal(decoded.me, decoded);
            },
        });
    });

    test('File: Referential Integrity', (t) => {
        t.plan(2);

        const obj = { a: 1 };
        const blob = new Blob([JSON.stringify(obj)]);
        const file = new File([blob], 'test.json');

        encode({
            x: file,
            y: file,
        }, {
            onFinish: (encoded) => {
                const decoded = decode(encoded);

                t.equal(decoded.x, decoded.y);
                t.notEqual(decoded.x, file);
            },
        });
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
                    Fi: [
                        [
                            [
                                'U10',
                                'St0',
                                'St1',
                                'Nu0',
                            ],
                            [
                                'St2',
                            ],
                            [
                                'fa',
                            ],
                        ],
                    ],
                    St: [
                        'application/json',
                        'test.json',
                        'a',
                    ],
                    U1: [
                        [
                            [
                                'Nu1',
                            ],
                        ],
                    ],
                    Nu: [
                        String(now),
                        '49',
                    ],
                    r: 'Fi0',
                });
            },
        });
    });
}
else {
    console.warn('Tests for File type skipped because the File type or the File Constructor is not supported in the current environment.'); // eslint-disable-line no-console
}
