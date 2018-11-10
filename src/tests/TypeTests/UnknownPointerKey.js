const test = require('tape');
const jsonComplete = require('../../main.js');

const decode = jsonComplete.decode;

test('Unknown Pointer Key: Inner Data', (t) => {
    t.plan(1);

    const innerData = [
        ["r", "ar0"],
        ["ar", [
            [
                ["--0"],
            ],
        ]],
        ["--", ["a"]],
    ];

    t.equal(decode(innerData)[0], '--0');
});

test('Unknown Pointer Key: Value Data', (t) => {
    t.plan(1);

    const valueData = [
        ["r", "--0"],
        ["--", ["a"]],
    ];

    t.equal(decode(valueData), '--0');
});

test('Unknown Pointer Key: Key Data', (t) => {
    t.plan(2);

    const objectKeyData = [
        ["r", "ob0"],
        ["ob", [
            [
                ["--0","nm0"],
            ],
        ]],
        ["nm", [1]],
        ["--", ["a"]],
    ];

    const decodedObjectKeys = Object.keys(decode(objectKeyData));

    t.equal(decodedObjectKeys.length, 1);
    t.equal(decodedObjectKeys[0], '--0');
});
