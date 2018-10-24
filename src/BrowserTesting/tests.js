// const Arguments = require('src/__tests__/Arguments.js');
// const Array = require('src/__tests__/Array.js');
// const ArrayBuffer = require('src/__tests__/ArrayBuffer.js');
// const AsyncForm = require('src/__tests__/AsyncForm.js');
// const AvoidStoringBuiltInSymbols = require('src/__tests__/AvoidStoringBuiltInSymbols.js');
// const Blob = require('src/__tests__/Blob.js');
// const Boolean = require('src/__tests__/Boolean.js');
// const Date = require('src/__tests__/Date.js');
// const Error = require('src/__tests__/Error.js');
// const File = require('src/__tests__/File.js');
// const Float32Array = require('src/__tests__/Float32Array.js');
// const Float64Array = require('src/__tests__/Float64Array.js');
// const Function = require('src/__tests__/Function.js');
// const Int16Array = require('src/__tests__/Int16Array.js');
// const Int32Array = require('src/__tests__/Int32Array.js');
// const Int8Array = require('src/__tests__/Int8Array.js');
// const Map = require('src/__tests__/Map.js');
// const Null = require('src/__tests__/Null.js');
// const Number = require('src/__tests__/Number.js');
// const Object = require('src/__tests__/Object.js');
// const ObjectWrappedBoolean = require('src/__tests__/ObjectWrappedBoolean.js');
// const ObjectWrappedNumber = require('src/__tests__/ObjectWrappedNumber.js');
// const ObjectWrappedString = require('src/__tests__/ObjectWrappedString.js');
// const ReferencialDepth = require('src/__tests__/ReferencialDepth.js');
// const Regex = require('src/__tests__/Regex.js');
// const Set = require('src/__tests__/Set.js');
// const SharedArrayBuffer = require('src/__tests__/SharedArrayBuffer.js');
// const String = require('src/__tests__/String.js');
// const Symbol = require('src/__tests__/Symbol.js');
// const Uint16Array = require('src/__tests__/Uint16Array.js');
// const Uint32Array = require('src/__tests__/Uint32Array.js');
// const Uint8Array = require('src/__tests__/Uint8Array.js');
// const Uint8ClampedArray = require('src/__tests__/Uint8ClampedArray.js');
// const Undefined = require('src/__tests__/Undefined.js');
// const UnknownPointerKey = require('src/__tests__/UnknownPointerKey.js');
// const UnsupportedTypes = require('src/__tests__/UnsupportedTypes.js');
// const WeakMap = require('src/__tests__/WeakMap.js');
// const WeakSet = require('src/__tests__/WeakSet.js');



const jsonComplete = require('src/main.js');

const encode = jsonComplete.encode;
const decode = jsonComplete.decode;

const encode2 = jsonComplete.encode2;
const decode2 = jsonComplete.decode2;

// console.log(JSON.stringify(encode(null), null, 4))

// const inner = {
//     loop: void 0,
//     d: [1,2],
// };

// const st = new String('test');
// st.x = 2;

// const arr = [
//     undefined,
//     null,
//     true,
//     false,
//     NaN,
//     -Infinity,
//     Infinity,
//     -0,
//     0,
//     1,
//     [],
//     [
//         1,
//         2,
//         3,
//     ],
//     {},
//     {
//         a: 1,
//         b: 2,
//         c: 3,
//     },
//     [
//         inner,
//         inner,
//     ],
//     'test',
//     st,
// ];
// arr.push(arr);

// inner.d[5] = 9;
// inner.loop = arr;
// inner.x = 2;

const box = {
    a: [],
};
let arrayRef = box.a;
const depth = 16000;
for (let d = 0; d < depth; d += 1) {
    if (d === depth - 1) {
        arrayRef[0] = 'here';
    }
    else {
        arrayRef[0] = [];
        arrayRef = arrayRef[0];
    }
}

const encoded = encode2(box);
const decoded = decode2(encoded);

arrayRef = decoded.a;
for (let d = 0; d < depth; d += 1) {
    arrayRef = arrayRef[0];
}

console.log(arrayRef)

// const encoded = encode2(arr);

console.log(encoded)

// const decoded = decode2(encoded);

console.log(decoded)