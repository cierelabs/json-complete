import undefinedType from '/types/undefinedType.js';
import nullType from '/types/nullType.js';
import NaNType from '/types/NaNType.js';
import InfinityType from '/types/InfinityType.js';
import NegativeInfinityType from '/types/NegativeInfinityType.js';
import Negative0Type from '/types/Negative0Type.js';
import trueType from '/types/trueType.js';
import falseType from '/types/falseType.js';
import NumberType from '/types/NumberType.js';
import StringType from '/types/StringType.js';
import SymbolType from '/types/SymbolType.js';
import ArrayType from '/types/ArrayType.js';
import ArgumentsType from '/types/ArgumentsType.js';
import ObjectType from '/types/ObjectType.js';
import BooleanObjectType from '/types/BooleanObjectType.js';
import NumberObjectType from '/types/NumberObjectType.js';
import StringObjectType from '/types/StringObjectType.js';
import DateType from '/types/DateType.js';
import RegExpType from '/types/RegExpType.js';
import ErrorType from '/types/ErrorType.js';
import ArrayBufferType from '/types/ArrayBufferType.js';
import SharedArrayBufferType from '/types/SharedArrayBufferType.js';
import Int8ArrayType from '/types/Int8ArrayType.js';
import Uint8ArrayType from '/types/Uint8ArrayType.js';
import Uint8ClampedArrayType from '/types/Uint8ClampedArrayType.js';
import Int16ArrayType from '/types/Int16ArrayType.js';
import Uint16ArrayType from '/types/Uint16ArrayType.js';
import Int32ArrayType from '/types/Int32ArrayType.js';
import Uint32ArrayType from '/types/Uint32ArrayType.js';
import Float32ArrayType from '/types/Float32ArrayType.js';
import Float64ArrayType from '/types/Float64ArrayType.js';
import SetType from '/types/SetType.js';
import MapType from '/types/MapType.js';
import BlobType from '/types/BlobType.js';
import FileType from '/types/FileType.js';
import BigIntType from '/types/BigIntType.js';

const types = {
    un: undefinedType,
    nl: nullType,
    na: NaNType,
    pI: InfinityType,
    nI: NegativeInfinityType,
    n0: Negative0Type,
    bt: trueType,
    bf: falseType,
    nm: NumberType, // ORDER MATTERS: General Number must come after special numbers NaN, -0, Infinity, and -Infinity
    st: StringType,
    sy: SymbolType,
    ar: ArrayType,
    ag: ArgumentsType,
    ob: ObjectType,
    BO: BooleanObjectType,
    NM: NumberObjectType,
    ST: StringObjectType,
    da: DateType,
    re: RegExpType,
    er: ErrorType,
    AB: ArrayBufferType,
    SA: SharedArrayBufferType,
    I1: Int8ArrayType,
    U1: Uint8ArrayType,
    C1: Uint8ClampedArrayType,
    I2: Int16ArrayType,
    U2: Uint16ArrayType,
    I3: Int32ArrayType,
    U3: Uint32ArrayType,
    F3: Float32ArrayType,
    F4: Float64ArrayType,
    Se: SetType,
    Ma: MapType,
    Bl: BlobType,
    Fi: FileType,
    BI: BigIntType,
};

export default types;
