const test = require('tape');
const jsonComplete = require('../main.js');
const testHelpers = require('../../_tools/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

// WeakMap is not fully supported because its internal data is not iterable, and therefore cannot be serialized.
// Attempting to encode WeakMaps will create several logs and store the value as a plain, empty Object.
// However, like any Object, WeakMaps can store arbitrary data via String or Symbol keys.

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

test('WeakMap: Not Supported', (t) => {
    t.plan(3);

    const source = [[{ a: { b: 2 } }, { a: { b: 2 } }]];

    const help = startup();
    const decoded = decode(encode([new WeakMap(source)]))[0];
    const callCount = help.getCallCount();
    help.shutdown();
    t.ok(callCount > 0);

    t.ok(testHelpers.isObject(decoded));
    t.equal(decoded.has, void 0);
});

test('WeakMap: Arbitrary Attached Data', (t) => {
    t.plan(4);

    const weakMap = new WeakMap([[{ a: { b: 2 } }, { a: { b: 2 } }]]);
    weakMap.x = 2;
    weakMap[Symbol.for('weakMap')] = 'test';

    const help = startup();
    const decodedWeakMap = decode(encode([weakMap]))[0];
    const callCount = help.getCallCount();
    help.shutdown();
    t.ok(callCount > 0);

    t.ok(testHelpers.isObject(decodedWeakMap));
    t.equal(decodedWeakMap.x, 2);
    t.equal(decodedWeakMap[Symbol.for('weakMap')], 'test');
});

test('WeakMap: Self-Containment', (t) => {
    t.plan(3);

    const weakMap = new WeakMap([[{ a: { b: 2 } }, { a: { b: 2 } }]]);
    weakMap.me = weakMap;

    const help = startup();
    const decodedWeakMap = decode(encode([weakMap]))[0];
    const callCount = help.getCallCount();
    help.shutdown();
    t.ok(callCount > 0);

    t.ok(testHelpers.isObject(decodedWeakMap));
    t.equal(decodedWeakMap.me, decodedWeakMap);
});

test('WeakMap: Referencial Integrity', (t) => {
    t.plan(3);

    const source = new WeakMap([[{ a: 1 }, { b: 2 }]]);

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
