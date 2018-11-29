import genPrimitive from '/utils/genPrimitive.js';

export default (typeObj) => {
    typeObj.St = genPrimitive(String);

    // Strings allow index access into the string value, which is already stored, so ignore indices
    typeObj.St._ignoreIndices = 1;

    typeObj.Nu = genPrimitive(Number);

    return typeObj;
};
