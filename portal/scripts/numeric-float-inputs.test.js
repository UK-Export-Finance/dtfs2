import {
  hasDecimalPlaces,
  trimDecimalPlaces,
  handleDecimalPlaces,
  numericFloatInputs,
} from './numeric-float-inputs';

describe('numericFloatInputs', () => {
  describe('hasDecimalPlaces', () => {
    it('should return true when a string has decimal places', () => {
      expect(hasDecimalPlaces('12.34')).toBeTruthy();
    });

    it('should return false when a string does not have decimal places', () => {
      expect(hasDecimalPlaces('12')).toBeFalsy();
    });
  });

  describe('trimDecimalPlaces', () => {
    it('should return a string with only 2 decimal places', () => {
      expect(trimDecimalPlaces('12.34.56')).toEqual('12.34');
    });
  });

  describe('handleDecimalPlaces', () => {
    it('should return a trimmed string when a string has more than 2 decimal places', () => {
      const str = '12.3456';
      expect(handleDecimalPlaces(str)).toEqual(
        trimDecimalPlaces(str),
      );
    });

    it('should return the given string when it does not have more than 2 decimal places', () => {
      const str = '12.34';
      expect(handleDecimalPlaces(str)).toEqual(str);
    });

    it('should return the given string when it does not have decimal places', () => {
      const str = '1234';
      expect(handleDecimalPlaces(str)).toEqual(str);
    });
  });

  describe('setInputFilter', () => {
    let elements;
    let input;

    beforeEach(() => {
      document.body.innerHTML = '<div>'
        + '  <input type="text" class="input--numeric-float" />'
        + '</div>';

      numericFloatInputs();

      elements = document.getElementsByTagName('input');
      const firstElement = elements[0];
      input = firstElement;
      // input = elements[0];
    });

    it('should trim the given value', () => {
      input.value = '123.12.123';

      const event = new Event('input', {
        bubbles: true,
        cancelable: true,
      });

      input.dispatchEvent(event);
      expect(document.getElementsByTagName('input')[0].value).toEqual('123.12');
    });

    it('should return empy string when there is no value', () => {
      const event = new Event('input', {
        bubbles: true,
        cancelable: true,
      });

      input.dispatchEvent(event);

      expect(document.getElementsByTagName('input')[0].value).toEqual('');
    });
  });
});
