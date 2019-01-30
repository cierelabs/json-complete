const test = require('tape');
const jsonComplete = require('/main.js');

// const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Malformed Encoded Data: Invalid Regex', (t) => {
    t.plan(1);

    const malformedEncoded = JSON.stringify([
        'R0',
        '1.0.2',
        [
            'R', 'S0S1N0',
        ],
        [
            'S',
            [
                '\\s+',
                '6', // Invalid Regex flag
            ],
        ],
        [
            'N', '0',
        ],
    ]);

    try {
        decode(malformedEncoded);
        t.ok(false);
    } catch (e) {
        t.equal(e.message, 'Cannot decode recognized pointer type "R".');
    }
});