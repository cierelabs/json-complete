export default (typeObj) => {
    typeObj.un = { _value: void 0 };
    typeObj.nl = { _value: null };
    typeObj.tr = { _value: true };
    typeObj.fa = { _value: false };
    typeObj.pI = { _value: Infinity };
    typeObj.nI = { _value: -Infinity };
    typeObj.Na = { _value: NaN };
    typeObj.n0 = { _value: -0 };

    return typeObj;
};
