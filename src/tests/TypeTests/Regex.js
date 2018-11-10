const test = require('tape');
const jsonComplete = require('../../main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Regex: Normal', (t) => {
    t.plan(1);
    const decodedRegex = decode(encode([/\s+/g]))[0];
    t.equal('a a  a  \t  a \n'.replace(decodedRegex, ''), 'aaaa');
});

test('Regex: Sticky Pre Use', (t) => {
    t.plan(4);

    const re = /abc. /y;
    const stickyTestString = 'abcd abcx abcy';

    const decodedRegex = decode(encode([re]))[0];
    t.equal(decodedRegex.lastIndex, 0);

    const match1 = stickyTestString.match(decodedRegex);

    t.equal(match1.length, 1);
    t.equal(match1[0], 'abcd ');
    t.equal(decodedRegex.lastIndex, 5);
});

test('Regex: Sticky Post Use', (t) => {
    t.plan(7);

    const re = /abc. /y;
    const stickyTestString = 'abcd abcx abcy';
    const match1 = stickyTestString.match(re);

    t.equal(match1.length, 1);
    t.equal(match1[0], 'abcd ');
    t.equal(re.lastIndex, 5);

    const decodedRegex = decode(encode([re]))[0];
    t.equal(decodedRegex.lastIndex, 5);

    const match2 = stickyTestString.match(decodedRegex);

    t.equal(match2.length, 1);
    t.equal(match2[0], 'abcx ');
    t.equal(decodedRegex.lastIndex, 10);
});

test('Regex: Same Regex is Different Reference', (t) => {
    t.plan(1);
    const decodedRegexArray = decode(encode([/\s+/g, /\s+/g]));
    t.notEqual(decodedRegexArray[0], decodedRegexArray[1]);
});

test('Regex: Root Value Source', (t) => {
    t.plan(1);
    t.equal(decode(encode(/\s+/g)).source, '\\s+');
});

test('Regex: Root Value Flags', (t) => {
    t.plan(1);
    t.equal(decode(encode(/\s+/g)).flags, 'g');
});

test('Regex: Root Value lastIndex', (t) => {
    t.plan(1);
    t.equal(decode(encode(/\s+/g)).lastIndex, 0);
});

test('Regex: Arbitrary Attached Data', (t) => {
    t.plan(3);

    const regex = /\s+/g;
    regex.x = 2;
    regex[Symbol.for('regex')] = 'test';

    const decodedRegex = decode(encode([regex]))[0];
    t.equal('a a  a  \t  a \n'.replace(decodedRegex, ''), 'aaaa');
    t.equal(decodedRegex.x, 2);
    t.equal(decodedRegex[Symbol.for('regex')], 'test');
});

test('Regex: Self-Containment', (t) => {
    t.plan(2);

    const regex = /\s+/g;
    regex.me = regex;

    const decodedRegex = decode(encode([regex]))[0];
    t.equal('a a  a  \t  a \n'.replace(decodedRegex, ''), 'aaaa');
    t.equal(decodedRegex.me, decodedRegex);
});

test('Regex: Referencial Integrity', (t) => {
    t.plan(2);

    const source = /\s+/g;

    const decoded = decode(encode({
        x: source,
        y: source,
    }));

    t.equal(decoded.x, decoded.y);
    t.notEqual(decoded.x, source);
});
