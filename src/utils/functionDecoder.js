// Doesn't provide much protection, only prevents an evaluation from affecting the ongoing decoding process
const x = function f(s) {
    try {
        eval(`f.b = ${s};`);
        return f.b;
    }
    catch (e) {
        // If it was an error, then it's possible that the item was a Method Function
        eval(`f.b = {${s}};`);
        return f.b[s.match(/\s*([^\s(]+)\s*\(/)[1]];
    }
};

module.exports = (s) => {
    delete x.b;
    return x(s)
}