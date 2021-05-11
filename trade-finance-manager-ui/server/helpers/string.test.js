const {
  isEmptyString,
  hasValue,
  containsNumber,
  isAlphanumeric,
} = require('./string');

describe('helpers - string', () => {
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

  describe('containsNumber', () => {
    it('should return true when string contains a number', () => {
      const result = containsNumber('asdf1asdf');
      expect(result).toEqual(true);
    });

    it('should return false wen string does NOT contain a number', () => {
      const result = containsNumber('asdf');
      expect(result).toEqual(false);
    });
  });

  describe('isAlphanumeric', () => {
    it('should return true when string contains letters, numbers, spaces, commas, full stops and hypens', () => {
      const str = 'hello, testing. 123 test\'s - TEST';

      const result = isAlphanumeric(str);
      expect(result).toEqual(true);
    });

    it('should return true when string contains multiple lines', () => {
      // eslint-disable-next-line no-multi-str
      const str = 'this\
      is\
      a\
      multi\
      line\
      string';

      const result = isAlphanumeric(str);
      expect(result).toEqual(true);
    });

    it('should return false when invalid characters provided', () => {
      const str = '!@£$%^&*(){}[];;"|<>?/`~';

      const result = isAlphanumeric(str);
      expect(result).toEqual(false);
    });
  });
});
