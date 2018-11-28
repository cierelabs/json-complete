const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

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

test('Object: Arbitrary Attached Data', (t) => {
    t.plan(2);

    const decodedObj = decode(encode([{
        x: 2,
        [Symbol.for('obj')]: 'test',
    }], {
        encodeSymbolKeys: true,
    }))[0];

    t.equal(decodedObj.x, 2);
    t.equal(decodedObj[Symbol.for('obj')], 'test');
});

test('Object: Self-Containment', (t) => {
    t.plan(1);

    const obj = {};
    obj.me = obj;
    const decodedObj = decode(encode([obj]))[0];

    t.equal(decodedObj.me, decodedObj);
});

test('Object: Referencial Integrity', (t) => {
    t.plan(2);

    const source = {};

    const decoded = decode(encode({
        x: source,
        y: source,
    }));

    t.equal(decoded.x, decoded.y);
    t.notEqual(decoded.x, source);
});

test('Object: Encoding Expected', (t) => {
    t.plan(1);

    t.deepEqual(testHelpers.simplifyEncoded(encode({ a: true })), {
        Ob: [
            [
                [
                    'St0',
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
