import ArrayBufferTypes from '/types/ArrayBufferTypes.js';
import ArrayLikeTypes from '/types/ArrayLikeTypes.js';
import BasePrimitiveTypes from '/types/BasePrimitiveTypes.js';
import BigIntType from '/types/BigIntType.js';
import BlobTypes from '/types/BlobTypes.js';
import DateType from '/types/DateType.js';
import ErrorType from '/types/ErrorType.js';
import KeyedCollectionTypes from '/types/KeyedCollectionTypes.js';
import ObjectType from '/types/ObjectType.js';
import RegExpType from '/types/RegExpType.js';
import SimpleTypes from '/types/SimpleTypes.js';
import SymbolType from '/types/SymbolType.js';
import TypedArrayTypes from '/types/TypedArrayTypes.js';
import WrappedPrimitiveTypes from '/types/WrappedPrimitiveTypes.js';

let types = {};
types = SimpleTypes(types);
types = BasePrimitiveTypes(types);
types = WrappedPrimitiveTypes(types);
types = ArrayLikeTypes(types);
types = ObjectType(types);
types = DateType(types);
types = RegExpType(types);
types = ErrorType(types);

// TODO: Exclude entirely from legacy version
types = SymbolType(types);
types = KeyedCollectionTypes(types);
types = TypedArrayTypes(types);
types = ArrayBufferTypes(types);
types = BlobTypes(types);
types = BigIntType(types);

export default types;
