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
