const test = require('tape');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

if (typeof Set === 'function' && typeof Map === 'function') {
    test('Referential Depth: Deep Reference Mixing Stress Test', (t) => {
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

        t.equal(decoded.a[0].values().next()['value'].get(1)[0].b.get(2).c[0][0][0].d, 3);
        t.equal(decoded.a[0].values().next()['value'].get(1)[0].b.get(2).c[0][0][1], decoded);
    });
}
else {
    console.warn('"Referential Depth: Deep Reference Mixing Stress Test" was skipped because it is not supported in the current environment.'); // eslint-disable-line no-console
}

test('Referential Depth: Extreme Array Depth Stress Test', (t) => {
    t.plan(1);

    const box = {
        a: [],
    };
    let arrayRef = box.a;
    const depth = 50000;
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

if (typeof Set === 'function') {
    test('Referential Depth: Extreme Set Depth Stress Test', (t) => {
        t.plan(1);

        let setRef = new Set();
        const parentRef = setRef;
        const depth = 50000;
        for (let d = 0; d < depth - 1; d += 1) {
            const newSet = new Set();
            setRef.add(newSet);
            setRef = newSet;
        }

        setRef.add(false);

        const encoded = encode(parentRef);
        const decoded = decode(encoded);

        setRef = decoded;
        for (let d = 0; d < depth; d += 1) {
            setRef = setRef.values().next().value;
        }

        t.equal(setRef, false);
    });
}

if (typeof Map === 'function') {
    test('Referential Depth: Extreme Map Depth Stress Test', (t) => {
        t.plan(1);

        let mapRef = new Map();
        const parentRef = mapRef;
        const depth = 50000;
        for (let d = 0; d < depth - 1; d += 1) {
            const newSet = new Map();
            mapRef.set(1, newSet);
            mapRef = newSet;
        }

        mapRef.set(1, false);

        const encoded = encode(parentRef);
        const decoded = decode(encoded);

        mapRef = decoded;
        for (let d = 0; d < depth; d += 1) {
            mapRef = mapRef.get(1);
        }

        t.equal(mapRef, false);
    });
}
