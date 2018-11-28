const test = require('tape');
const testHelpers = require('/tests/testHelpers.js');
const jsonComplete = require('/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

const genArgs = function() {
    return arguments;
};

test('Arguments: Normal', (t) => {
    t.plan(5);

    const obj = { a: 2 };
    const arr = [[[3]]];

    const args = genArgs(1, 'a', obj, arr);

    const decoded = decode(encode([args]))[0];

    t.equal(testHelpers.systemName(decoded), '[object Arguments]');
    t.equal(decoded[0], 1);
    t.equal(decoded[1], 'a');
    t.deepEqual(decoded[2], obj);
    t.deepEqual(decoded[3], arr);
});

test('Arguments: Empty', (t) => {
    t.plan(2);

    const args = genArgs();

    const decoded = decode(encode([args]))[0];

    t.equal(testHelpers.systemName(decoded), '[object Arguments]');
    t.deepEqual(Array.from(decoded), []);
});

test('Arguments: Root Value', (t) => {
    t.plan(5);

    const obj = { a: 2 };
    const arr = [[[3]]];

    const args = genArgs(1, 'a', obj, arr);

    const decoded = decode(encode(args));

    t.equal(testHelpers.systemName(decoded), '[object Arguments]');
    t.equal(decoded[0], 1);
    t.equal(decoded[1], 'a');
    t.deepEqual(decoded[2], obj);
    t.deepEqual(decoded[3], arr);
});

test('Arguments: Sparse Index', (t) => {
    t.plan(3);

    const args = genArgs(1, 2);
    args[9] = 9;

    const decoded = decode(encode([args]))[0];

    t.equal(decoded[0], 1);
    t.equal(decoded[1], 2);
    t.deepEqual(decoded[9], 9);
});

test('Arguments: Non-Index Keys', (t) => {
    t.plan(6);

    const sharedObj = {
        a: 1,
    };

    const args = genArgs(1, sharedObj);

    args['x'] = 5;
    args['obj'] = sharedObj;
    args[Symbol.for('arguments')] = 6;

    const decoded = decode(encode(args, {
        encodeSymbolKeys: true,
    }));

    t.equal(testHelpers.systemName(decoded), '[object Arguments]');
    t.equal(decoded[0], 1);
    t.equal(decoded['x'], 5);
    t.deepEqual(decoded[1], sharedObj);
    t.equal(decoded[Symbol.for('arguments')], 6);
    t.equal(decoded[1], decoded['obj']);
});

test('Arguments: Direct Self-Containment', (t) => {
    t.plan(4);

    const args = genArgs(1, void 0);
    args[1] = args;

    const decoded = decode(encode([args]))[0];

    t.equal(testHelpers.systemName(decoded), '[object Arguments]');
    t.equal(decoded[0], 1);
    t.equal(testHelpers.systemName(decoded[1]), '[object Arguments]');
    t.equal(decoded[1], decoded);
});

test('Arguments: Arbitrary Attached Data', (t) => {
    t.plan(3);

    const args = genArgs();

    args.x = 2;
    args[Symbol.for('arguments')] = 'test';

    const decoded = decode(encode({
        a: args,
    }, {
        encodeSymbolKeys: true,
    })).a;

    t.equal(decoded.length, 0);
    t.equal(decoded.x, 2);
    t.equal(decoded[Symbol.for('arguments')], 'test');
});

test('Arguments: Self-Containment', (t) => {
    t.plan(1);

    const args = genArgs();

    args.me = args;
    const decoded = decode(encode([args]))[0];

    t.equal(decoded.me, decoded);
});

test('Arguments: Referencial Integrity', (t) => {
    t.plan(2);

    const args = genArgs();

    const decoded = decode(encode({
        x: args,
        y: args,
    }));

    t.equal(decoded.x, decoded.y);
    t.notEqual(decoded.x, args);
});

test('Arguments: Encoding Expected', (t) => {
    t.plan(1);

    const args = genArgs('a');

    t.deepEqual(testHelpers.simplifyEncoded(encode(args)), {
        rg: [
            [
                [
                    'St0',
                ],
            ],
        ],
        St: [
            'a',
        ],
        r: 'rg0',
    });
});
