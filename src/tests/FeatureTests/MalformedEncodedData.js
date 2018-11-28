const test = require('tape');
const jsonComplete = require('/main.js');

// const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Malformed Encoded Data: Invalid Regex', (t) => {
    t.plan(1);

    const malformedEncoded = [
        [
            'Re',
            [
                [
                    [
                        'St0',
                        'St1',
                        'Nu0',
                    ],
                ],
            ],
        ],
        [
            'St',
            [
                '\\s+',
                '6', // Invalid Regex flag
                '0',
            ],
        ],
        [
            'Nu',
            [
                'St2',
            ],
        ],
        [
            'r',
            'Re0',
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
        t.equal(e.message, 'Cannot generate recognized object type from pointer type "Re".');
    }
});