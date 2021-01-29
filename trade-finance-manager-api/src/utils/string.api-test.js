const {
  isEmptyString,
  hasValue,
  stripCommas,
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
      expect(stripCommas('10,123.45')).toEqual('10123.45');
    });
  });
});
