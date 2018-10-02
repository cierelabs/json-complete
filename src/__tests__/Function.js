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