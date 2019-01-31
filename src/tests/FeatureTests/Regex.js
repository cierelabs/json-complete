const test = require('tape');
const jsonComplete = require('/main.js');
const StandardObjectTests = require('/tests/StandardObjectTests.js');
const testHelpers = require('/tests/testHelpers.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

test('Regex: Normal', (t) => {
    t.plan(1);
    const decodedRegex = decode(encode([/\s+/g]))[0];
    t.equal('a a  a  \t  a \n'.replace(decodedRegex, ''), 'aaaa');
});

// IE11 and below do not support sticky RegExp
if (testHelpers.regexSupportsSticky()) {
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
}

// Decoding sticky encoded RegExp objects should either be an error, or graceful in compat mode
if (!testHelpers.regexSupportsSticky()) {
    console.log('Regex: Extra tests for Unsupported Sticky RegExp Decoding tests were run because Sticky RegExp Flags are not supported in the current environment.'); // eslint-disable-line no-console

    // encode(/abc/y);
    const encodedSticky = '["R0","1.0.2",["R","S0S1N0"],["S",["abc","y"]],["N","0"]]';

    test('Regex: Sticky RegExp Decoding When Not Supported', (t) => {
        t.plan(2);

        try {
            decode(encodedSticky);
            t.ok(false);
            t.ok(false);
        } catch(e) {
            t.equal('Cannot decode recognized pointer type "R".', e.message);
            t.ok(true);
        }
    });

    test('Regex: Sticky RegExp Decoding When Not Supported in Compat Mode', (t) => {
        t.plan(2);

        try {
            const decodedRegex = decode(encodedSticky, {
                compat: true,
            });
            const flags = decodedRegex.flags === void 0 ? decodedRegex.options : decodedRegex.flags;
            t.equal(decodedRegex.source, 'abc');
            t.equal(flags, '');
        } catch(e) {
            t.ok(false);
            t.ok(false);
        }
    });
}

// Decoding unicode encoded RegExp objects should either be an error, or graceful in compat mode
if (!testHelpers.regexSupportsUnicode()) {
    console.log('Regex: Extra tests for Unsupported Unicode RegExp Decoding tests were run because Unicode RegExp Flags are not supported in the current environment.'); // eslint-disable-line no-console

    // encode(/abc/u);
    const encodedUnicode = '["R0","1.0.2",["R","S0S1N0"],["S",["abc","u"]],["N","0"]]';

    test('Regex: Unicode RegExp Decoding When Not Supported', (t) => {
        t.plan(2);

        try {
            decode(encodedUnicode);
            t.ok(false);
            t.ok(false);
        } catch(e) {
            t.equal('Cannot decode recognized pointer type "R".', e.message);
            t.ok(true);
        }
    });

    test('Regex: Unicode RegExp Decoding When Not Supported in Compat Mode', (t) => {
        t.plan(2);

        try {
            const decodedRegex = decode(encodedUnicode, {
                compat: true,
            });
            const flags = decodedRegex.flags === void 0 ? decodedRegex.options : decodedRegex.flags;
            t.equal(decodedRegex.source, 'abc');
            t.equal(flags, '');
        } catch(e) {
            t.ok(false);
            t.ok(false);
        }
    });
}

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
    const decodedRegex = decode(encode(/\s+/g));
    // Edge and IE use `options` parameter instead of `flags`, regardless of what it says on MDN
    const flags = decodedRegex.flags === void 0 ? decodedRegex.options : decodedRegex.flags;
    t.equal(flags, 'g');
});

test('Regex: Root Value lastIndex', (t) => {
    t.plan(1);
    t.equal(decode(encode(/\s+/g)).lastIndex, 0);
});

StandardObjectTests('Regex', 'RegExp', () => {
    return /\s+/g;
});

test('Regex: Encoding Expected', (t) => {
    t.plan(1);

    const source = /\s+/g;
    source.b = false;

    t.deepEqual(testHelpers.simplifyEncoded(encode(source)), {
        R: 'S0S1N0 S2 F0',
        N: '0',
        S: [
            '\\s+',
            'g',
            'b',
        ],
        r: 'R0',
    });
});
