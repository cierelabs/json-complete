import test from '/tests/tape.js';
import testHelpers from '/tests/testHelpers.js';
import jsonComplete from '/main.js';

const encode = jsonComplete.encode;

test('Deduplication: Numbers', (t) => {
    t.plan(1);

    const encoded = testHelpers.simplifyEncoded(encode([1, 2, 1, 3.14, 4, 3.14]));

    t.deepEqual(encoded.N, '7<{`5fg');
});

test('Deduplication: Strings', (t) => {
    t.plan(2);

    const encoded = testHelpers.simplifyEncoded(encode(['a', 'b', 'a', '', 'c', '']));

    t.equal(encoded.S.length, 4);
    t.deepEqual(encoded.S, ['a', 'b', '', 'c']);
});

if (typeof BigInt === 'function') {
    test('Deduplication: BigInt', (t) => {
        t.plan(1);

        const encoded = testHelpers.simplifyEncoded(encode([BigInt(1), BigInt(2), BigInt(1), BigInt(0), BigInt(-1), BigInt(0)]));

        t.deepEqual(encoded.I, '7<}/:g');
    });
}
else {
    console.log('Tests for BigInt Deduplication skipped because BigInt is not supported in the current environment.'); // eslint-disable-line no-console
}

if (typeof Symbol === 'function') {
    test('Deduplication: Symbols', (t) => {
        t.plan(2);

        const sharedSymbol = Symbol('shared');
        const encoded = testHelpers.simplifyEncoded(encode([sharedSymbol, Symbol.for('unshared'), sharedSymbol]));

        t.equal(encoded.P.length, 2);
        t.deepEqual(encoded.P, [
            'sshared',
            'runshared',
        ]);
    });
}
else {
    console.log('Tests for Symbol Deduplication skipped because Symbol is not supported in the current environment.'); // eslint-disable-line no-console
}

test('Deduplication: Objects', (t) => {
    t.plan(2);

    const sharedObj = {
        a: 1,
    };
    const encoded = testHelpers.simplifyEncoded(encode([sharedObj, {}, sharedObj]));

    t.equal(encoded.O.split(',').length, 2);
    t.deepEqual(encoded.O.split(',')[0].split(' '), ['S0', 'N0']);
});

test('Deduplication: Array', (t) => {
    t.plan(2);

    const sharedArr = [1];
    const encoded = testHelpers.simplifyEncoded(encode({
        a: sharedArr,
        b: [2],
        c: sharedArr,
    }));

    t.equal(encoded.A.split(',').length, 2);
    t.deepEqual(encoded.A.split(','), ['N0', 'N1']);
});
