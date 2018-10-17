const test = require('tape');
const jsonComplete = require('../main.js');
const testHelpers = require('../../_tools/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Arguments: Normal', (t) => {
    t.plan(2);

    let args;

    const thing = function() {
        args = arguments;
    };

    thing(1, 'a', { a: 2 }, [[[3]]]);

    const decoded = decode(encode([args]))[0];

    t.deepEqual(decoded, [1, 'a', { a: 2 }, [[[3]]]]);
    t.equal(testHelpers.systemName(decoded), '[object Array]');
});

test('Arguments: Empty', (t) => {
    t.plan(1);

    let args;

    const thing = function() {
        args = arguments;
    };

    thing();

    const decoded = decode(encode(args));

    t.deepEqual(decoded, []);
});

test('Arguments: Root Value', (t) => {
    t.plan(2);

    let args;

    const thing = function() {
        args = arguments;
    };

    thing(1, 'a', { a: 2 }, [[[3]]]);

    const decoded = decode(encode(args));

    t.deepEqual(decoded, [1, 'a', { a: 2 }, [[[3]]]]);
    t.equal(testHelpers.systemName(decoded), '[object Array]');
});

test('Arguments: Non-Index Keys', (t) => {
    t.plan(7);

    const sharedObj = {
        a: 1,
    };

    let args;

    const thing = function() {
        args = arguments;
    };

    thing(1, sharedObj);

    args['x'] = 5;
    args['obj'] = sharedObj;
    args[Symbol()] = 6;

    const decoded = decode(encode(args));

    t.ok(testHelpers.isArray(decoded));
    t.equal(decoded[0], 1);
    t.equal(decoded['x'], 5);
    t.deepEqual(decoded[1], sharedObj);
    t.equal(Object.getOwnPropertySymbols(decoded).length, 1);
    t.equal(decoded[Object.getOwnPropertySymbols(decoded)[0]], 6);
    t.equal(decoded[1], decoded['obj']);
});

test('Arguments: Arbitrary Attached Data', (t) => {
    t.plan(3);

    let args;

    const thing = function() {
        args = arguments;
    };

    thing();

    args.x = 2;
    args[Symbol.for('arguments')] = 'test';

    const decoded = decode(encode({
        a: args,
    })).a;

    t.equal(decoded.length, 0);
    t.equal(decoded.x, 2);
    t.equal(decoded[Symbol.for('arguments')], 'test');
});

test('Arguments: Self-Containment', (t) => {
    t.plan(1);

    let args;

    const thing = function() {
        args = arguments;
    };

    thing();

    args.me = args;
    const decoded = decode(encode([args]))[0];

    t.equal(decoded.me, decoded);
});

test('Arguments: Referencial Integrity', (t) => {
    t.plan(2);

    let args;

    const thing = function() {
        args = arguments;
    };

    thing();

    const decoded = decode(encode({
        x: args,
        y: args,
    }));

    t.equal(decoded.x, decoded.y);
    t.notEqual(decoded.x, args);
});
