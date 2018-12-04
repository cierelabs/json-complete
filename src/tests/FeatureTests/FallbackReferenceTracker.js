const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;

test('Fallback Reference Tracker: Generates Same Output', (t) => {
    t.plan(3);

    const globalThis = testHelpers.getGlobal();

    const oldMap = globalThis.Map;

    globalThis.Map = {};

    t.equal(testHelpers.systemName(globalThis.Map), '[object Object]');

    const encoded = encode([1]);

    t.deepEqual(testHelpers.simplifyEncoded(encoded), {
        Ar: [
            [
                [
                    'Nu0',
                ],
            ],
        ],
        Nu: [
            '1',
        ],
        r: 'Ar0',
    });

    globalThis.Map = oldMap;

    t.equal(testHelpers.systemName(globalThis.Map), '[object Function]');
});
