// Doesn't provide much protection, only prevents an evaluation from affecting the ongoing decoding process
const x = function f(s) {
    try {
        eval(`f.b = ${s};`);
        return f.b;
    }
    catch (e) {
        try {
            // If it was an error, then it's possible that the item was a Method Function
            eval(`f.b = {${s}};`);
            return f.b[s.match(/\s*([^\s(]+)\s*\(/)[1]];
        }
        catch (e) {
            return function() {
                throw `This function could not be decoded successfully: ${s}`;
            };
        }
    }
};

export default (s) => {
    delete x.b;
    return x(s);
};
