const test = require('tape');
const jsonComplete = require('../main.js');
const testHelpers = require('../../_tools/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Referencial Depth: Deep Reference Mixing Stress Test', (t) => {
    t.plan(2);

    const deepValue = [
        {
            d: 3,
        },
        'loop',
    ];

    const source = {
        a: [
            new Set([
                new Map([
                    [
                        1,
                        [
                            {
                                b: new Map([
                                    [
                                        2,
                                        {
                                            c: [
                                                [
                                                    deepValue,
                                                ],
                                            ],
                                        },
                                    ],
                                ]),
                            },
                        ],
                    ],
                ]),
            ]),
        ],
    };

    deepValue[1] = source;

    const encoded = encode(source);
    const decoded = decode(encoded);

    t.equal(decoded.a[0].values().next().value.get(1)[0].b.get(2).c[0][0][0].d, 3);
    t.equal(decoded.a[0].values().next().value.get(1)[0].b.get(2).c[0][0][1], decoded);
});


test('Referencial Depth: Extreme Depth Stress Test', (t) => {
    t.plan(1);

    const box = {
        a: [],
    };
    let arrayRef = box.a;
    const depth = 16000;
    for (let d = 0; d < depth; d += 1) {
        if (d === depth - 1) {
            arrayRef[0] = 'here';
        }
        else {
            arrayRef[0] = [];
            arrayRef = arrayRef[0];
        }
    }

    const encoded = encode(box);
    const decoded = decode(encoded);

    arrayRef = decoded.a;
    for (let d = 0; d < depth; d += 1) {
        arrayRef = arrayRef[0];
    }

    t.equal(arrayRef, 'here');
});
