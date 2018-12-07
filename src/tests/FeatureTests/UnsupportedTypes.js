const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

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

test('Unsupported Types: Arbitrary Attached Data', (t) => {
    t.plan(3);

    const source = Math;
    source.x = 2;
    source[Symbol.for('FullyUnsupportedTypes')] = 'test';

    const decodedFullyUnsupportedTypes = decode(encode([source], {
        compat: true,
        encodeSymbolKeys: true,
    }))[0];

    t.ok(testHelpers.isObject(decodedFullyUnsupportedTypes));
    t.equal(decodedFullyUnsupportedTypes.x, 2);
    t.equal(decodedFullyUnsupportedTypes[Symbol.for('FullyUnsupportedTypes')], 'test');

    delete source.x;
    delete source[Symbol.for('FullyUnsupportedTypes')];
});

test('Unsupported Types: Self-Containment', (t) => {
    t.plan(2);

    const source = Math;
    source.me = source;

    const decodedFullyUnsupportedTypes = decode(encode([source], {
        compat: true,
    }))[0];

    t.ok(testHelpers.isObject(decodedFullyUnsupportedTypes));
    t.equal(decodedFullyUnsupportedTypes.me, decodedFullyUnsupportedTypes);

    delete source.me;
});

test('Unsupported Types: Referencial Integrity', (t) => {
    t.plan(2);

    const source = Math;

    const decoded = decode(encode({
        x: source,
        y: source,
    }, {
        compat: true,
    }));

    t.equal(decoded.x, decoded.y);
    t.notEqual(decoded.x, source);
});

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
                ],
                [
                    'fa',
                ],
            ],
        ],
        St: [
            'a',
        ],
        r: 'Ob0',
    });
});
