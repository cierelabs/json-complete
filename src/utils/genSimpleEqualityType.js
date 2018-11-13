export default (value) => {
    return {
        _identify: (v) => {
            return v === value;
        },
        _value: value,
    };
};
