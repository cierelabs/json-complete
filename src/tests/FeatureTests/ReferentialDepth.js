const test = require('tape');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

const first = (collection) => {
    let item = void 0;
    let done = false;

    collection.forEach((v) => {
        if (done) {
            return;
        }

        item = v;
        done = true;
    });

    return item;
};

if (typeof Set === 'function' && typeof Map === 'function') {
    test('Referential Depth: Deep Reference Mixing Stress Test', (t) => {
        t.plan(2);

        const deepValue = [
            {
                d: 3,
            },
            'loop',
        ];

        const innerMap = new Map();
        innerMap.set(2, {
            c: [
                [
                    deepValue,
                ],
            ],
        });

        const outerMap = new Map();
        outerMap.set(1, [
            {
                b: innerMap,
            },
        ]);

        const outerSet = new Set();
        outerSet.add(outerMap);

        const source = {
            a: [
                outerSet,
            ],
        };

        deepValue[1] = source;

        const encoded = encode(source);
        const decoded = decode(encoded);

        t.equal(first(decoded.a[0]).get(1)[0].b.get(2).c[0][0][0].d, 3);
        t.equal(first(decoded.a[0]).get(1)[0].b.get(2).c[0][0][1], decoded);
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
            setRef = first(setRef);
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
