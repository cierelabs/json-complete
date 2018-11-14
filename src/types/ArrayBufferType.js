import genArrayBuffer from '/utils/genArrayBuffer.js';
import tryCreateType from '/utils/tryCreateType.js';

export default tryCreateType(typeof ArrayBuffer, () => {
    return genArrayBuffer('ArrayBuffer', ArrayBuffer);
});
