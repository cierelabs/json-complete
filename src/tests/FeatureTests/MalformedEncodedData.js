const test = require('tape');
const jsonComplete = require('/main.js');

// const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Malformed Encoded Data: Invalid Regex', (t) => {
    t.plan(1);

    const malformedEncoded = [
        [
            're',
            [
                [
                    [
                        'st0',
                        'st1',
                        'nm0',
                    ],
                ],
            ],
        ],
        [
            'st',
            [
                '\\s+',
                '6', // Invalid Regex flag
                '0',
            ],
        ],
        [
            'nm',
            [
                'st2',
            ],
        ],
        [
            'r',
            're0',
        ],
        [
            'v',
            '1.0.0',
        ],
    ];

    try {
        decode(malformedEncoded);
        t.ok(false);
    } catch (e) {
        t.equal(e.message, 'Cannot generate recognized object type from pointer type "re".');
    }
});