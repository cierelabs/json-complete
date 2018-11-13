export default {
    _identify: (v) => {
        return v === 0 && (1 / v) === -Infinity;
    },
    _value: -0,
};
