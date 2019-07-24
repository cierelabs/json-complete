const genEqualitySimpleType = (value) => {
    return {
        _identify: (comparedTo) => {
            return value === comparedTo;
        },
        _value: value,
    };
};

export default (typeObj) => {
    typeObj.$0 = genEqualitySimpleType(void 0);
    typeObj.$1 = genEqualitySimpleType(null);
    typeObj.$2 = genEqualitySimpleType(true);
    typeObj.$3 = genEqualitySimpleType(false);
    typeObj.$4 = genEqualitySimpleType(Infinity);
    typeObj.$5 = genEqualitySimpleType(-Infinity);
    typeObj.$6 = {
        _identify: (value) => {
            return value !== value;
        },
        _value: NaN,
    };
    typeObj.$7 = {
        _identify: (value) => {
            return value === 0 && (1 / value) === -Infinity;
        },
        _value: -0,
    };

    return typeObj;
};
