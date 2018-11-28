const test = require('tape');
const jsonComplete = require('/main.js');

const decode = jsonComplete.decode;

test('Unknown Pointer Key: Inner Data', (t) => {
    t.plan(1);

    const innerData = [
        ['r', 'Ar0'],
        ['Ar', [
            [
                ['--0'],
            ],
        ]],
        ['--', ['a']],
    ];

    t.equal(decode(innerData, {
        safeMode: true,
    })[0], '--0');
});

test('Unknown Pointer Key: Root Value', (t) => {
    t.plan(1);

    const valueData = [
        ['r', '--0'],
        ['--', ['a']],
    ];

    t.equal(decode(valueData, {
        safeMode: true,
    }), '--0');
});

test('Unknown Pointer Key: Key Data', (t) => {
    t.plan(2);

    const objectKeyData = [
        ['r', 'Ob0'],
        ['Ob', [
            [
                ['--0', 'St0'],
            ],
        ]],
        ['St', ['1']],
        ['--', ['a']],
    ];

    const decodedObjectKeys = Object.keys(decode(objectKeyData, {
        safeMode: true,
    }));

    t.equal(decodedObjectKeys.length, 1);
    t.equal(decodedObjectKeys[0], '--0');
});

test('Unknown Pointer Key: Non-Safe Mode', (t) => {
    t.plan(1);

    const innerData = [
        ['r', 'Ar0'],
        ['Ar', [
            [
                ['--0'],
            ],
        ]],
        ['--', ['a']],
    ];

    try {
        decode(innerData, {
            safeMode: false,
        });
        t.ok(false);
    } catch (e) {
        t.equal(e.message, 'Cannot decode unrecognized pointer type "--".');
    }
});

test('Unknown Pointer Key: Root Value Non-Safe Mode', (t) => {
    t.plan(1);

    const valueData = [
        ['r', '--0'],
        ['--', ['a']],
    ];

    try {
        decode(valueData, {
            safeMode: false,
        });
        t.ok(false);
    } catch (e) {
        t.equal(e.message, 'Cannot decode unrecognized pointer type "--".');
    }
});
