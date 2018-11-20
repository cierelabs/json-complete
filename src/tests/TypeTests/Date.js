const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Date: Normal', (t) => {
    t.plan(1);
    const now = Date.now();
    t.equal(decode(encode([new Date(now)]))[0].getTime(), now);
});

test('Date: Invalid Date', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNanValue(decode(encode([new Date('')]))[0].getTime()));
});

test('Date: Root Value Normal', (t) => {
    t.plan(1);
    const now = Date.now();
    t.equal(decode(encode(new Date(now))).getTime(), now);
});

test('Date: Root Value Invalid Date', (t) => {
    t.plan(1);
    t.ok(testHelpers.isNanValue(decode(encode(new Date(''))).getTime()));
});

test('Date: Arbitrary Attached Data', (t) => {
    t.plan(3);
    const now = Date.now();
    const date = new Date(now);
    date.x = 2;
    date[Symbol.for('date')] = 'test';
    const decodedDate = decode(encode([date]))[0];
    t.equal(decodedDate.getTime(), now);
    t.equal(decodedDate.x, 2);
    t.equal(decodedDate[Symbol.for('date')], 'test');
});

test('Date: Self-Containment', (t) => {
    t.plan(2);
    const now = Date.now();
    const date = new Date(now);
    date.me = date;
    const decodedDate = decode(encode([date]))[0];
    t.equal(decodedDate.getTime(), now);
    t.equal(decodedDate.me, decodedDate);
});

test('Date: Referencial Integrity', (t) => {
    t.plan(2);

    const source = new Date('2018-04-01');

    const decoded = decode(encode({
        x: source,
        y: source,
    }));

    t.equal(decoded.x, decoded.y);
    t.notEqual(decoded.x, source);
});

test('Date: Encoding Expected', (t) => {
    t.plan(1);

    const now = Date.now();
    const date = new Date(now);
    date.a = false;

    t.deepEqual(testHelpers.simplifyEncoded(encode(date)), {
        da: [
            [
                'nm0',
                [
                    'st0',
                    'bf',
                ],
            ],
        ],
        st: [
            'a',
            String(now),
        ],
        nm: [
            'st1',
        ],
        r: 'da0',
    });
});
