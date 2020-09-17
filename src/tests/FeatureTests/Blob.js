import test from '/tests/tape.js';
import jsonComplete from '/main.js';
import StandardObjectTests from '/tests/StandardObjectTests.js';
import testHelpers from '/tests/testHelpers.js';

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof Blob === 'function') {
    test('Blob: Normal', (t) => {
        t.plan(3);

        const obj = { a: 1 };
        const source = new Blob([JSON.stringify(obj)], { type: 'application/json' });

        encode([source], {
            onFinish: (encoded) => {
                const decoded = decode(encoded)[0];

                const reader = new FileReader();
                reader.addEventListener('loadend', () => {
                    t.deepEqual(JSON.parse(reader.result), obj);
                });
                reader.readAsText(decoded);

                t.equal(testHelpers.systemName(decoded), '[object Blob]');
                t.equal(decoded.type, 'application/json');
            },
        });
    });

    test('Blob: Empty Type', (t) => {
        t.plan(2);

        const obj = { a: 1 };
        const source = new Blob([JSON.stringify(obj)]);

        encode([source], {
            onFinish: (encoded) => {
                const decoded = decode(encoded)[0];

                t.equal(testHelpers.systemName(decoded), '[object Blob]');
                t.equal(decoded.type, '');
            },
        });
    });

    test('Blob: Root Value', (t) => {
        t.plan(3);

        const obj = { a: 1 };
        const source = new Blob([JSON.stringify(obj)], { type: 'application/json' });

        encode(source, {
            onFinish: (encoded) => {
                const decoded = decode(encoded);

                const reader = new FileReader();
                reader.addEventListener('loadend', () => {
                    t.deepEqual(JSON.parse(reader.result), obj);
                });
                reader.readAsText(decoded);

                t.equal(testHelpers.systemName(decoded), '[object Blob]');
                t.equal(decoded.type, 'application/json');
            },
        });
    });

    test('Blob: Missing onFinish Option', (t) => {
        t.plan(1);

        const obj = { a: 1 };
        const source = new Blob([JSON.stringify(obj)], { type: 'application/json' });

        try {
            encode([source]);
            t.ok(false);
        } catch (e) {
            t.equal(e.message, 'Deferred Types require onFinish option.');
        }
    });

    StandardObjectTests('Blob', 'Blob', () => {
        const obj = { a: 1 };
        return new Blob([JSON.stringify(obj)], { type: 'application/json' });
    });

    test('Blob: Encoding Expected', (t) => {
        t.plan(1);

        const blob = new Blob([JSON.stringify(1)], { type: 'application/json' });
        blob.a = false;

        encode(blob, {
            onFinish: (encoded) => {
                t.deepEqual(testHelpers.simplifyEncoded(encoded), {
                    Y: 'UE0S0 S1 $3',
                    S: [
                        'application/json',
                        'a',
                    ],
                    UE: 'N0',
                    N: 'ig',
                    r: 'Y0',
                });
            },
        });
    });
}
else {
    console.log('Tests for Blob type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
