import types from '/src/types.mjs';

export default (pointerKey) => {
    return types[pointerKey] && !types[pointerKey].encodeValue;
};
