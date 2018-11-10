export default (types, pointerKey) => {
    return types[pointerKey] && !types[pointerKey]._encodeValue;
};
