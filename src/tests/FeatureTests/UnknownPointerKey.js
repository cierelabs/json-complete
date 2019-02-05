const test = require('tape');
const jsonComplete = require('/main.js');

const decode = jsonComplete.decode;

test('Unknown Pointer Key: Inner Data', (t) => {
    t.plan(1);

    const innerData = JSON.stringify([
        'Q0',
        '2.0.0',
        ['Q', 'NOTUSED0'],
        ['NOTUSED', ['a']],
    ]);

    t.equal(decode(innerData, {
        compat: true,
    })[0], 'NOTUSED0');
});

test('Unknown Pointer Key: Root Value', (t) => {
    t.plan(1);

    const valueData = JSON.stringify([
        'NOTUSED0',
        '2.0.0',
        ['NOTUSED', ['a']],
    ]);

    t.equal(decode(valueData, {
        compat: true,
    }), 'NOTUSED0');
});

test('Unknown Pointer Key: Key Data', (t) => {
    t.plan(2);

    const objectKeyData = JSON.stringify([
        'O0',
        '2.0.0',
        ['O', 'NOTUSED0 S0'],
        ['S', ['1']],
        ['NOTUSED', ['a']],
    ]);

    const decodedObjectKeys = Object.keys(decode(objectKeyData, {
        compat: true,
    }));

    t.equal(decodedObjectKeys.length, 1);
    t.equal(decodedObjectKeys[0], 'NOTUSED0');
});

test('Unknown Pointer Key: Non-Compat Mode', (t) => {
    t.plan(1);

    const innerData = JSON.stringify([
        'Q0',
        '2.0.0',
        ['Q', 'NOTUSED0'],
        ['NOTUSED', ['a']],
    ]);

    try {
        decode(innerData, {
            compat: false,
        });
        t.ok(false);
    } catch (e) {
        t.equal(e.message, 'Cannot decode unrecognized pointer type "NOTUSED".');
    }
});

test('Unknown Pointer Key: Root Value Non-Compat Mode', (t) => {
    t.plan(1);

    const valueData = JSON.stringify([
        'NOTUSED0',
        '2.0.0',
        ['NOTUSED', ['a']],
    ]);

    try {
        decode(valueData, {
            compat: false,
        });
        t.ok(false);
    } catch (e) {
        t.equal(e.message, 'Cannot decode unrecognized pointer type "NOTUSED".');
    }
});
