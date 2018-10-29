import types from '/src/utils/types.mjs';

export default (pointerKey) => {
    return (types[pointerKey] || {}).deferredEncode;
};
