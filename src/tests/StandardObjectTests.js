const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

module.exports = (name, expectedSystemName, generater, compatMode) => {
    test(`${name}: Arbitrary Attached Data with String Key`, (t) => {
        t.plan(2);

        const obj = generater();

        obj.x = 2;

        const options = {
            onFinish: (encoded) => {
                const decoded = decode(encoded).a;

                t.equal(testHelpers.systemName(decoded).slice(8, -1), expectedSystemName);
                t.equal(decoded.x, 2);
            },
            compat: compatMode,
        };

        encode({
            a: obj,
        }, options);
    });

    if (typeof Symbol === 'function') {
        test(`${name}: Arbitrary Attached Data with Symbol Key`, (t) => {
            t.plan(2);

            const obj = generater();

            obj[Symbol.for('attached')] = 3;

            const options = {
                encodeSymbolKeys: true,
                onFinish: (encoded) => {
                    const decoded = decode(encoded).a;

                    t.equal(testHelpers.systemName(decoded).slice(8, -1), expectedSystemName);
                    t.equal(decoded[Symbol.for('attached')], 3);
                },
                compat: compatMode,
            };

            encode({
                a: obj,
            }, options);
        });
    }

    test(`${name}: Self-Containment`, (t) => {
        t.plan(1);

        const obj = generater();
        obj.me = obj;

        const options = {
            onFinish: (encoded) => {
                const decoded = decode(encoded)[0];

                t.equal(decoded.me, decoded);
            },
            compat: compatMode,
        };

        encode([obj], options);
    });

    test(`${name}: Referential Integrity`, (t) => {
        t.plan(2);

        const obj = generater();

        const options = {
            onFinish: (encoded) => {
                const decoded = decode(encoded);

                t.equal(decoded.x, decoded.y);
                t.notEqual(decoded.x, obj);
            },
            compat: compatMode,
        };

        encode({
            x: obj,
            y: obj,
        }, options);
    });
};
