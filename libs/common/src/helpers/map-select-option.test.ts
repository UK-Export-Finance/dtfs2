import { mapSelectOption } from './map-select-option';

describe('mapSelectOption', () => {
  describe('when selectedValue is provided and matches the value', () => {
    it('should map an array of strings to an array of objects with value and label properties and selected to be true', () => {
      const option = 'Option 1';

      const result = mapSelectOption(option, option, option);

      const expected = {
        text: option,
        value: option,
        selected: true,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when selectedValue is provided and does not match the value', () => {
    it('should map an array of strings to an array of objects with value and label properties and selected to be false', () => {
      const option = 'Option 1';
      const selectedValue = 'Option 2';

      const result = mapSelectOption(option, option, selectedValue);

      const expected = {
        text: option,
        value: option,
        selected: false,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when selectedValue is not provided', () => {
    it('should map an array of strings to an array of objects with value and label properties and selected to be false', () => {
      const option = 'Option 1';

      const result = mapSelectOption(option, option);

      const expected = {
        text: option,
        value: option,
        selected: false,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when selectedValue is an empty string', () => {
    it('should map an array of strings to an array of objects with value and label properties and selected to be false', () => {
      const option = 'Option 1';
      const selectedValue = '';

      const result = mapSelectOption(option, option, selectedValue);

      const expected = {
        text: option,
        value: option,
        selected: false,
      };

      expect(result).toEqual(expected);
    });
  });
});
