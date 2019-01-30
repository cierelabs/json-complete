const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof BigUint64Array === 'function') {
    test('BigUint64Array: Normal', (t) => {
        t.plan(3);

        const a = new BigUint64Array(2);
        a[0] = BigInt(1);
        a[1] = BigInt(2);

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object BigUint64Array]');
        t.equal(decoded[0], BigInt(1));
        t.equal(decoded[1], BigInt(2));
    });

    test('BigUint64Array: Empty Cells', (t) => {
        t.plan(2);

        const a = new BigUint64Array(2);
        a[0] = BigInt(1);

        const decoded = decode(encode([a]))[0];

        t.equal(decoded[0], BigInt(1));
        t.equal(decoded[1], BigInt(0));
    });

    test('BigUint64Array: Empty', (t) => {
        t.plan(2);

        const a = new BigUint64Array(0);

        const decoded = decode(encode([a]))[0];

        t.equal(testHelpers.systemName(decoded), '[object BigUint64Array]');
        t.equal(decoded.length, 0);
    });

    test('BigUint64Array: Root Value', (t) => {
        t.plan(1);
        t.deepEqual(decode(encode(new BigUint64Array([BigInt(1)]))), new BigUint64Array([BigInt(1)]));
    });

    test('BigUint64Array: Arbitrary Attached Data with String Key', (t) => {
        t.plan(2);

        const obj = new BigUint64Array(2);

        obj.x = 2;

        const options = {
            onFinish: (encoded) => {
                const decoded = decode(encoded).a;

                t.equal(testHelpers.systemName(decoded).slice(8, -1), 'BigUint64Array');
                t.equal(decoded.x, 2);
            },
            compat: false,
        };

        encode({
            a: obj,
        }, options);
    });

    if (typeof Symbol === 'function') {
        test('BigUint64Array: Arbitrary Attached Data with Symbol Key', (t) => {
            t.plan(2);

            const obj = new BigUint64Array(2);

            obj[Symbol.for('attached')] = 3;

            const options = {
                encodeSymbolKeys: true,
                onFinish: (encoded) => {
                    const decoded = decode(encoded).a;

                    t.equal(testHelpers.systemName(decoded).slice(8, -1), 'BigUint64Array');
                    t.equal(decoded[Symbol.for('attached')], 3);
                },
                compat: false,
            };

            encode({
                a: obj,
            }, options);
        });
    }
    else {
        console.warn('Test for BigUint64Array Arbitrary Attachment Data with Symbol Key skipped because Symbols are not supported in the current environment.'); // eslint-disable-line no-console
    }

    test('BigUint64Array: Self-Containment', (t) => {
        t.plan(1);

        const obj = new BigUint64Array(2);
        obj.me = obj;

        const options = {
            onFinish: (encoded) => {
                const decoded = decode(encoded)[0];

                t.equal(decoded.me, decoded);
            },
            compat: false,
        };

        encode([obj], options);
    });

    test('BigUint64Array: Referential Integrity', (t) => {
        t.plan(2);

        const obj = new BigUint64Array(2);

        const options = {
            onFinish: (encoded) => {
                const decoded = decode(encoded);

                t.equal(decoded.x, decoded.y);
                t.notEqual(decoded.x, obj);
            },
            compat: false,
        };

        encode({
            x: obj,
            y: obj,
        }, options);
    });

    test('BigUint64Array: Encoding Expected', (t) => {
        t.plan(1);

        const source = new BigUint64Array(1);
        source[0] = BigInt(1);
        source.a = false;

        t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
            BU: [
                [
                    [
                        'Bi0',
                    ],
                    [
                        'St0',
                    ],
                    [
                        'fa',
                    ],
                ],
            ],
            Bi: [
                '1',
            ],
            St: [
                'a',
            ],
            r: 'BU0',
        });
    });
}
else {
    console.warn('Tests for BigUint64Array type skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}
