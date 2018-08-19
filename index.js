import { toArray, toString, toNumber, toPlainObject, isPlainObject, isString, isNumber } from 'lodash';
import { MinKey, MaxKey, Long, Double, Int32, Decimal128, Binary, BSONRegExp, Code, Symbol, Timestamp, ObjectId } from 'bson';

module.exports = (ajv) => {

  require('ajv-bsontype')(ajv);

  const CASTERS = {
    array: toArray,

    binary(object) {
      return new Binary(String(object), Binary.SUBTYPE_DEFAULT);
    },

    boolean(object) {
      if (isString(object)) {
        const str = object.toLowerCase();

        if (str === 'true') {
          return true;
        } else if (str === 'false') {
          return false;
        }

        throw new Error(`'${object}' is not a valid boolean string`);
      }

      if (object) {
        return true;
      }

      return false;
    },

    code(object) {
      return new Code(String(object), {});
    },

    date(object) {
      return new Date(object);
    },

    decimal(object) {
      if (object._bsontype && [ 'Long', 'Int32', 'Double', 'Decimal128' ].includes(object._bsontype)) {
        object = object._bsontype === 'Long' ? object.toNumber() : object.valueOf();
      }

      return Decimal128.fromString(String(object));
    },

    double(object) {
      if ((object === '-') || (object === '')) {
        throw new Error(`Value '${object}' is not a valid Double value`);
      }

      if (isString(object) && object.endsWith('.')) {
        throw new Error("Please enter at least one digit after the decimal");
      }

      const number = toNumber(object);

      return new Double(number);
    },

    int(number) {
      const string = toString(number);

      if (!/^-?\d+$/.test(string)) {
        return DOUBLE;
      }

      const value = toNumber(string);

      if ((value >= -0x80000000) && (value <= 0x7FFFFFFF)) {
        return new Int32(value);
      }

      if (Number.isSafeInteger(value)) {
        return Long.fromNumber(value);
      }

      return false;
    },

    maxkey() {
      return new MaxKey;
    },

    minkey() {
      return new MinKey;
    },

    null() {
      return null;
    },

    object(object) {
      return toPlainObject(object);
    },

    objectId(object) {
      if (!isString(object) || (object === '')) {
        return new ObjectId;
      }

      return ObjectId.createFromHexString(object);
    },

    regex(object) {
      return new BSONRegExp(String(object));
    },

    string: toString,

    symbol(object) {
      return new Symbol(String(object));
    },

    timestamp(object) {
      const number = toNumber(object);
      return Timestamp.fromNumber(number);
    },

    undefined() {
      return undefined;
    }
  };

  const coerce = (object, type) => {
    const caster = CASTERS[type];
    let result = object;

    if (caster) {
      result = caster(object);
    }

    if (result === '[object Object]') {
      return '';
    } else {
      return result;
    }
  };

  ajv.addKeyword('coerce', {
    type: 'string',
    errors: false,
    modifying: true,
    valid: true,
    compile(schema, parentSchema) {

      return (data, path, object, key) => {
        if (!parentSchema.coerce || !object) { return; }

        let j = 0;
        const l = schema.length;

        while (j < l) {
          data = transform[schema[j]](data, cfg);
          j++;
        }

        object[key] = data;

      };
    }
  });

  return ajv;
};
