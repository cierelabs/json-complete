const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const decode = jsonComplete.decode;

const time = 1522558801000;

const encodedFileInArray = JSON.stringify([
    [
        'A',
        [
            [
                [
                    'Z0'
                ]
            ]
        ]
    ],
    [
        'Z',
        [
            [
                [
                    '$0',
                    'S0',
                    'S1',
                    'N0'
                ]
            ]
        ]
    ],
    [
        '$',
        [
            [
                [
                    'N1'
                ]
            ]
        ]
    ],
    [
        'S',
        [
            'text/plain',
            '1.txt'
        ]
    ],
    [
        'N',
        [
            String(time),
            '49'
        ]
    ],
    [
        'r',
        'A0'
    ],
    [
        'v',
        '1.0.0'
    ]
]);


if (typeof Blob === 'function') {
    test('File Blob Fallback: Throws without compat mode', (t) => {
        t.plan(2);

        const globalThis = testHelpers.getGlobal();

        const oldFile = globalThis.File;

        globalThis.File = () => {
            throw new Error('No File support');
        };

        try {
            const decoded = decode(encodedFileInArray); // eslint-disable-line
            t.ok(false);
        } catch (e) {
            t.equal(e.message, 'Cannot decode recognized pointer type "Z".');
        }

        globalThis.File = oldFile;

        t.ok(true);
    });

    test('File Blob Fallback: Creates blob duck-type in compat mode', (t) => {
        t.plan(6);

        const globalThis = testHelpers.getGlobal();

        const oldFile = globalThis.File;

        globalThis.File = () => {
            throw new Error('No File support');
        };

        const decoded = decode(encodedFileInArray, {
            compat: true,
        });

        const obj = decoded[0];

        t.equal(testHelpers.systemName(obj), '[object Blob]');
        t.equal(obj.name, '1.txt');
        t.equal(obj.type, 'text/plain');
        t.equal(obj.lastModified, time);

        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
            t.equal(JSON.parse(reader.result), 1);

            globalThis.File = oldFile;

            t.ok(true);
        });
        reader.readAsText(obj);
    });
}
else {
    console.warn('Tests for File Blob Fallback skipped because Blobs are not supported in the current environment.'); // eslint-disable-line no-console
}
