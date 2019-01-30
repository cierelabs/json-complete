const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Object: Normal', (t) => {
    t.plan(1);
    t.deepEqual(decode(encode([{ a: 1 }]))[0], { a: 1 });
});

test('Object: Root Value Normal', (t) => {
    t.plan(1);
    t.deepEqual(decode(encode({ a: 1 })), { a: 1 });
});

test('Object: Store Undefined', (t) => {
    t.plan(1);
    t.equal(decode(encode({ 'un': void 0 }))['un'], void 0);
});

test('Object: Number Key', (t) => {
    t.plan(1);
    t.equal(decode(encode({ ['0']: 1 }))['0'], 1);
});

test('Object: String Key', (t) => {
    t.plan(1);
    t.equal(decode(encode({ ['']: 2 }))[''], 2);
});

test('Object: Nested Objects', (t) => {
    t.plan(1);

    const nestedObj = decode(encode({
        a: {
            b: {
                c: {
                    d: {
                        e: 5,
                    },
                },
            },
        },
    }));

    t.equal(nestedObj.a.b.c.d.e, 5);
});

test('Object: Circular Object References', (t) => {
    t.plan(2);

    const circular = {
        x: {
            y: {
                z: void 0,
            },
        },
    };
    circular.x.y.z = circular;
    const decodedCircularObj = decode(encode(circular));

    t.equal(decodedCircularObj, decodedCircularObj.x.y.z);
    t.equal(decodedCircularObj, decodedCircularObj.x.y.z.x.y.z);
});

StandardObjectTests('Object', 'Object', () => {
    return {};
});

test('Object: Encoding Expected', (t) => {
    t.plan(1);

    t.deepEqual(testHelpers.simplifyEncoded(encode({ a: true })), {
        Ob: [
            [
                [
                    'St0',
                ],
                [
                    'tr',
                ],
            ],
        ],
        St: [
            'a',
        ],
        r: 'Ob0',
    });
});
