const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Unsupported Types: Normal', (t) => {
    t.plan(2);

    const encoded = encode([Math], {
        compat: true,
    });
    const decoded = decode(encoded)[0];

    t.ok(testHelpers.isObject(decoded));
    t.deepEqual(Object.keys(decoded).concat(Object.getOwnPropertySymbols(decoded)), []);
});

test('Unsupported Types: Root Value', (t) => {
    t.plan(2);

    const encoded = encode(Math, {
        compat: true,
    });
    const decoded = decode(encoded);

    t.ok(testHelpers.isObject(decoded));
    t.deepEqual(Object.keys(decoded).concat(Object.getOwnPropertySymbols(decoded)), []);
});

test('Unsupported Types: Normal Throw', (t) => {
    t.plan(1);

    try {
        encode([Math], {
            compat: false,
        });

        t.ok(false);
    } catch (e) {
        t.equal('Cannot encode unsupported type "Math".', e.message);
    }
});

test('Unsupported Types: Root Value Throw', (t) => {
    t.plan(1);

    try {
        encode(Math, {
            compat: false,
        });

        t.ok(false);
    } catch (e) {
        t.equal('Cannot encode unsupported type "Math".', e.message);
    }
});

StandardObjectTests('Unsupported Types', 'Object', () => {
    return Math;
}, true);

test('Unsupported Types: Encoding Expected', (t) => {
    t.plan(1);

    const source = Math;
    source.a = false;

    t.deepEqual(testHelpers.simplifyEncoded(encode(source, {
        compat: true,
    })), {
        Ob: [
            [
                [
                    'St0',
                    'St1',
                    'St2',
                ],
                [
                    'Nu0',
                    'Ob0',
                    'fa',
                ],
            ],
        ],
        St: [
            'x',
            'me',
            'a',
        ],
        Nu: [
            '2',
        ],
        r: 'Ob0',
    });
});
