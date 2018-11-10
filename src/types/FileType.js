import decodePointer from '/utils/decodePointer.js';
import genBlobLike from '/utils/genBlobLike.js';

/* istanbul ignore next */
export default genBlobLike('File', ['name', 'type', 'lastModified'], (store, buffer, dataArray) => {
    return new File(buffer, decodePointer(store, dataArray[1]), {
        type: decodePointer(store, dataArray[2]),
        lastModified: decodePointer(store, dataArray[3])
    });
});
