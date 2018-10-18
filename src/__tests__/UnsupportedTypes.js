const test = require('tape');
const jsonComplete = require('../main.js');
const testHelpers = require('../../_tools/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

const startup = () => {
    const oldLog = console.log;

    let callCount = 0;

    const caller = () => {
        callCount += 1;
    };

    console.log = caller;

    return {
        getCallCount: () => {
            return callCount;
        },
        shutdown: () => {
            callCount = 0;
            console.log = oldLog;
        },
    };
};

test('Unsupported Types: Normal', (t) => {
    t.plan(3);

    const help = startup();
    const encoded = encode([Math]);
    const decoded = decode(encoded)[0];
    const callCount = help.getCallCount();
    help.shutdown();

    t.ok(callCount > 0);
    t.ok(testHelpers.isObject(decoded));
    t.deepEqual(Object.keys(decoded).concat(Object.getOwnPropertySymbols(decoded)), []);
});

test('Unsupported Types: Arbitrary Attached Data', (t) => {
    t.plan(4);

    const source = Math;
    source.x = 2;
    source[Symbol.for('FullyUnsupportedTypes')] = 'test';

    const help = startup();
    const decodedFullyUnsupportedTypes = decode(encode([source]))[0];
    const callCount = help.getCallCount();
    help.shutdown();
    t.ok(callCount > 0);

    t.ok(testHelpers.isObject(decodedFullyUnsupportedTypes));
    t.equal(decodedFullyUnsupportedTypes.x, 2);
    t.equal(decodedFullyUnsupportedTypes[Symbol.for('FullyUnsupportedTypes')], 'test');

    delete source.x;
    delete source[Symbol.for('FullyUnsupportedTypes')];
});

test('Unsupported Types: Self-Containment', (t) => {
    t.plan(3);

    const source = Math;
    source.me = source;

    const help = startup();
    const decodedFullyUnsupportedTypes = decode(encode([source]))[0];
    const callCount = help.getCallCount();
    help.shutdown();
    t.ok(callCount > 0);

    t.ok(testHelpers.isObject(decodedFullyUnsupportedTypes));
    t.equal(decodedFullyUnsupportedTypes.me, decodedFullyUnsupportedTypes);

    delete source.me;
});

test('Unsupported Types: Referencial Integrity', (t) => {
    t.plan(3);

    const source = Math;

    const help = startup();
    const decoded = decode(encode({
        x: source,
        y: source,
    }));
    const callCount = help.getCallCount();
    help.shutdown();
    t.ok(callCount > 0);

    t.equal(decoded.x, decoded.y);
    t.notEqual(decoded.x, source);
});
