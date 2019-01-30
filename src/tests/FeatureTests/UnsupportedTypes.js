const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Unsupported Types: Normal', (t) => {
    t.plan(2);

    const encoded = encode([() => {}], {
        compat: true,
    });
    const decoded = decode(encoded)[0];

    t.ok(testHelpers.isObject(decoded));

    let keys = Object.keys(decoded);
    if (typeof Symbol === 'function') {
        keys = keys.concat(Object.getOwnPropertySymbols(decoded));
    }

    t.deepEqual(keys, []);
});

test('Unsupported Types: Root Value', (t) => {
    t.plan(2);

    const encoded = encode(() => {}, {
        compat: true,
    });
    const decoded = decode(encoded);

    t.ok(testHelpers.isObject(decoded));

    let keys = Object.keys(decoded);
    if (typeof Symbol === 'function') {
        keys = keys.concat(Object.getOwnPropertySymbols(decoded));
    }

    t.deepEqual(keys, []);
});

test('Unsupported Types: Normal Throw', (t) => {
    t.plan(1);

    try {
        encode([() => {}], {
            compat: false,
        });

        t.ok(false);
    } catch (e) {
        t.equal('Cannot encode unsupported type "Function".', e.message);
    }
});

test('Unsupported Types: Root Value Throw', (t) => {
    t.plan(1);

    try {
        encode(() => {}, {
            compat: false,
        });

        t.ok(false);
    } catch (e) {
        t.equal('Cannot encode unsupported type "Function".', e.message);
    }
});

StandardObjectTests('Unsupported Types', 'Object', () => {
    return () => {};
}, true);

test('Unsupported Types: Encoding Expected', (t) => {
    t.plan(1);

    const source = () => {};
    source.a = false;

    t.deepEqual(testHelpers.simplifyEncoded(encode(source, {
        compat: true,
    })), {
        O: 'S0 F0',
        S: [
            'a',
        ],
        r: 'O0',
    });
});
