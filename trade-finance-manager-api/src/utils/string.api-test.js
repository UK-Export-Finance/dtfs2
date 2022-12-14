const {
  isEmptyString,
  hasValue,
  stripCommas,
  capitalizeFirstLetter,
  lowercaseFirstLetter,
} = require('./string');

describe('utils - string', () => {
  describe('isEmptyString', () => {
    it('Should return true when string is empty or is pure whitespace', () => {
      expect(isEmptyString('')).toEqual(true);
      expect(isEmptyString(' ')).toEqual(true);
      expect(isEmptyString('   ')).toEqual(true);
    });

    it('Should return false when param is a string', () => {
      expect(isEmptyString('a')).toEqual(false);
    });

    it('Should return true, upon void argument', () => {
      expect(isEmptyString()).toEqual(true);
      expect(isEmptyString(null)).toEqual(true);
      expect(isEmptyString(undefined)).toEqual(true);
    });
  });

  describe('hasValue', () => {
    it('Should return true when a string is passed', () => {
      expect(hasValue('test')).toEqual(true);
    });

    it('Should return false when there is no value passed or is empty/whitespace', () => {
      expect(hasValue()).toEqual(false);
      expect(hasValue('')).toEqual(false);
      expect(hasValue(' ')).toEqual(false);
    });

    it('Should return false, upon void argument', () => {
      expect(hasValue()).toEqual(false);
      expect(hasValue(null)).toEqual(false);
      expect(hasValue(undefined)).toEqual(false);
    });
  });

  describe('stripCommas', () => {
    it('Should remove commas from a string', () => {
      expect(stripCommas('9,876,543,120,987.99')).toEqual('9876543120987.99');
    });

    it('Number to String typecasting, should return as a string', () => {
      expect(stripCommas(9876543120987.99)).toEqual('9876543120987.99');
    });

    it('Should return false, upon void argument', () => {
      expect(hasValue()).toEqual(false);
      expect(hasValue(null)).toEqual(false);
      expect(hasValue(undefined)).toEqual(false);
    });
  });

  describe('capitalizeFirstLetter', () => {
    it('Should capitalize the first letter of a string', () => {
      const result = capitalizeFirstLetter('testing');
      expect(result).toEqual('Testing');
    });

    it('Number to String typecasting, should return as a string', () => {
      const result = capitalizeFirstLetter(123.00);
      expect(result).toEqual('123');
    });

    it('Should return false, upon void argument', () => {
      expect(hasValue()).toEqual(false);
      expect(hasValue(null)).toEqual(false);
      expect(hasValue(undefined)).toEqual(false);
    });
  });

  describe('lowercaseFirstLetter', () => {
    it('Should lowercase the first letter of a string', () => {
      const result = lowercaseFirstLetter('Testing');
      expect(result).toEqual('testing');
    });

    it('Number to String typecasting, should return as a string', () => {
      const result = capitalizeFirstLetter(123.123);
      expect(result).toEqual('123.123');
    });

    it('Should return false, upon void argument', () => {
      expect(hasValue()).toEqual(false);
      expect(hasValue(null)).toEqual(false);
      expect(hasValue(undefined)).toEqual(false);
    });
  });
});
