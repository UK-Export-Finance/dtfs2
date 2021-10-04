const {
  isEmptyString,
  hasValue,
  stripCommas,
  capitalizeFirstLetter,
  lowercaseFirstLetter,
} = require('./string');

describe('utils - string', () => {
  describe('isEmptyString', () => {
    it('should return true when string is empty or is pure whitespace', () => {
      expect(isEmptyString('')).toEqual(true);
      expect(isEmptyString(' ')).toEqual(true);
      expect(isEmptyString('   ')).toEqual(true);
    });

    it('should return false when param is a string', () => {
      expect(isEmptyString('a')).toEqual(false);
    });
  });

  describe('hasValue', () => {
    it('should return true when a string is passed', () => {
      expect(hasValue('test')).toEqual(true);
    });

    it('should return false when there is no value passed or is empty/whitespace', () => {
      expect(hasValue()).toEqual(false);
      expect(hasValue(null)).toEqual(false);
      expect(hasValue('')).toEqual(false);
      expect(hasValue(' ')).toEqual(false);
    });
  });

  describe('stripCommas', () => {
    it('should remove commas from a string', () => {
      expect(stripCommas('9,876,543,120,987.99')).toEqual('9876543120987.99');
    });
  });

  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter of a string', () => {
      const result = capitalizeFirstLetter('testing');
      expect(result).toEqual('Testing');
    });
  });

  describe('lowercaseFirstLetter', () => {
    it('should lowercase the first letter of a string', () => {
      const result = lowercaseFirstLetter('Testing');
      expect(result).toEqual('testing');
    });
  });
});
