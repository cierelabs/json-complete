const test = require('tape');
const jsonComplete = require('../main.js');
const testHelpers = require('../../_tools/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Function: Function Expression', (t) => {
    t.plan(2);
    const decodedFunc = decode(encode([function() { return 1; }]))[0];
    t.ok(testHelpers.isFunction(decodedFunc));
    t.equal(decodedFunc(), 1);
});

test('Function: Named Function Expression', (t) => {
    t.plan(2);
    const decodedFunc = decode(encode([function test() { return Object.prototype.toString.call(test) === '[object Function]'; }]))[0];
    t.ok(testHelpers.isFunction(decodedFunc));
    t.equal(decodedFunc(), true);
});

test('Function: Arrow Function', (t) => {
    t.plan(2);
    const decodedFunc = decode(encode([() => { return 1; }]))[0];
    t.ok(testHelpers.isFunction(decodedFunc));
    t.equal(decodedFunc(), 1);
});

test('Function: Bare Arrow Function', (t) => {
    t.plan(2);
    const decodedFunc = decode(encode([a => 1]))[0];
    t.ok(testHelpers.isFunction(decodedFunc));
    t.equal(decodedFunc(), 1);
});

test('Function: Method Function', (t) => {
    t.plan(2);
    const decodedObj = decode(encode({
        func() {
            return 1;
        },
    }));

    t.ok(testHelpers.isFunction(decodedObj.func));
    t.equal(decodedObj.func(), 1);
});

test('Function: Root Value Normal', (t) => {
    t.plan(2);
    const decodedFunction = decode(encode(() => { return 1; }));
    t.ok(testHelpers.isFunction(decodedFunction));
    t.equal(decodedFunction(), 1);
});

test('Function: Arbitrary Attached Data', (t) => {
    t.plan(3);

    const func = function() { return 1; };
    func.x = 2;
    func[Symbol.for('function')] = 'test';

    const decodedFunc = decode(encode([func]))[0];

    t.equal(decodedFunc(), 1);
    t.equal(decodedFunc.x, 2);
    t.equal(decodedFunc[Symbol.for('function')], 'test');
});

test('Function: Self-Containment', (t) => {
    t.plan(2);

    const func = function() { return 1; };
    func.me = func;

    const decodedFunc = decode(encode([func]))[0];

    t.equal(decodedFunc(), 1);
    t.equal(decodedFunc.me, decodedFunc);
});

test('Function: Named Function Expression Attached Data Referencing', (t) => {
    t.plan(3);

    const func = function myFunction() {
        myFunction.x += 1;
        return myFunction.x;
    };
    func.x = 0;

    const decodedFunc = decode(encode([func]))[0];

    t.equal(decodedFunc.x, 0);
    t.equal(decodedFunc(), 1);
    t.equal(decodedFunc.x, 1);
});

test('Function: Referencial Integrity', (t) => {
    t.plan(2);

    const source = () => {};

    const decoded = decode(encode({
        x: source,
        y: source,
    }));

    t.equal(decoded.x, decoded.y);
    t.notEqual(decoded.x, source);
});
