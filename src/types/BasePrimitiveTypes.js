import genPrimitive from '/utils/genPrimitive.js';

export default (typeObj) => {
    typeObj.S = genPrimitive(String);

    typeObj.N = genPrimitive(Number, 1);

    return typeObj;
};
