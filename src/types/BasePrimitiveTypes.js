import genPrimitive from '/utils/genPrimitive.js';

export default (typeObj) => {
    typeObj.St = genPrimitive(String);

    typeObj.Nu = genPrimitive(Number);

    return typeObj;
};
