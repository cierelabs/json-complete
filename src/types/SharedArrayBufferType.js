import genArrayBuffer from '/utils/genArrayBuffer.js';
import tryCreateType from '/utils/tryCreateType.js';

export default tryCreateType(typeof SharedArrayBuffer, () => {
    return genArrayBuffer('SharedArrayBuffer', SharedArrayBuffer);
});
