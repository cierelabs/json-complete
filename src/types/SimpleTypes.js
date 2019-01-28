export default (typeObj) => {
    typeObj.K = { _value: void 0 };
    typeObj.L = { _value: null };
    typeObj.T = { _value: true };
    typeObj.F = { _value: false };
    typeObj.I = { _value: Infinity };
    typeObj.J = { _value: -Infinity };
    typeObj.C = { _value: NaN };
    typeObj.M = { _value: -0 };

    return typeObj;
};
