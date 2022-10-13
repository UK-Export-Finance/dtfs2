/**
 * @jest-environment jsdom
 */
import maskedInputs from './masked-inputs';

describe('maskedInputs', () => {
  describe('setInputMask', () => {
    let input;

    beforeEach(() => {
      document.body.innerHTML = '<div>'
        + '  <input id="maskInput" type="text" data-mask="currency" />'
        + '</div>';

      maskedInputs();

      input = document.getElementById('maskInput');
    });

    it('should format the value as its input', () => {
      input.value = '1234567';

      const event = new Event('input', {
        bubbles: true,
        cancelable: true,
      });

      input.dispatchEvent(event);

      expect(document.getElementById('maskInput').value).toEqual('1,234,567');
    });

    it('should format integer value with decimals after entry', () => {
      input.value = '1234567';

      const event = new Event('blur', {
        bubbles: true,
        cancelable: true,
      });

      input.dispatchEvent(event);

      expect(document.getElementById('maskInput').value).toEqual('1,234,567.00');
    });

    it('should format the value with decimals', () => {
      input.value = '1234567.81';

      const event = new Event('input', {
        bubbles: true,
        cancelable: true,
      });

      input.dispatchEvent(event);

      expect(document.getElementById('maskInput').value).toEqual('1,234,567.81');
    });

    it('should format the value to 2 decimal places after entry', () => {
      input.value = '1234567.8';

      const event = new Event('blur', {
        bubbles: true,
        cancelable: true,
      });

      input.dispatchEvent(event);

      expect(document.getElementById('maskInput').value).toEqual('1,234,567.80');
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
