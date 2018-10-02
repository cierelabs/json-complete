const test = require('tape');
const jsonComplete = require('../main.js');

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
