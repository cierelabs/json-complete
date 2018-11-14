const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Unsupported Types: Normal', (t) => {
    t.plan(2);

    const encoded = encode([Math], {
        safeMode: true,
    });
    const decoded = decode(encoded)[0];

    t.ok(testHelpers.isObject(decoded));
    t.deepEqual(Object.keys(decoded).concat(Object.getOwnPropertySymbols(decoded)), []);
});

test('Unsupported Types: Arbitrary Attached Data', (t) => {
    t.plan(3);

    const source = Math;
    source.x = 2;
    source[Symbol.for('FullyUnsupportedTypes')] = 'test';

    const decodedFullyUnsupportedTypes = decode(encode([source], {
        safeMode: true,
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
        safeMode: true,
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
        safeMode: true,
    }));

    t.equal(decoded.x, decoded.y);
    t.notEqual(decoded.x, source);
});
