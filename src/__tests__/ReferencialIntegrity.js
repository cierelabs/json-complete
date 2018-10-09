const test = require('tape');
const jsonComplete = require('../main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

const items = [
    ['Regex', /\s+/g],
    ['Date', new Date()],
    ['Symbol', Symbol()],
    ['Function', () => { return 1; }],
    ['Object', {}],
    ['Array', []],
    ['Object-Wrapped Boolean', new Boolean(false)],
    ['Object-Wrapped Number', new Number(1)],
    ['Object-Wrapped Non-Standard Number', new Number(NaN)],
    ['Object-Wrapped String', new String('text')],
    ['Int8Array', new Int8Array(1)],
    ['Uint8Array', new Uint8Array(1)],
    ['Uint8ClampedArray', new Uint8ClampedArray(1)],
    ['Int16Array', new Int16Array(1)],
    ['Uint16Array', new Uint16Array(1)],
    ['Int32Array', new Int32Array(1)],
    ['Uint32Array', new Uint32Array(1)],
    ['Float32Array', new Float32Array(1)],
    ['Float64Array', new Float64Array(1)],
    ['Set', new Set([1])],
];

items.forEach((item) => {
    test(`Referencial Integrity: ${item[0]}`, (t) => {
        t.plan(2);

        const decoded = decode(encode({
            x: item[1],
            y: item[1],
        }));

        // The same reference in the encoded data will result in the shared references in the decoded data
        t.equal(decoded.x, decoded.y);

        // However, the act of serializing the source data at all means that the reference to the original reference will be lost
        t.notEqual(decoded.x, item[1]);
    });
});
