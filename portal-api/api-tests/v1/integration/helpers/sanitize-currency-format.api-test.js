const santizeCurrencyFormat = require('../../../../src/v1/controllers/integration/helpers/convert-currency-format');

describe('converts currency format', () => {
  describe('valid formats', () => {
    it('converts 1234', async () => {
      const currency = santizeCurrencyFormat('1234');
      expect(currency).toEqual('1234');
    });

    it('converts 1,234', async () => {
      const currency = santizeCurrencyFormat('1,234');
      expect(currency).toEqual('1234');
    });

    it('converts 1,234.00', async () => {
      const currency = santizeCurrencyFormat('1,234.00');
      expect(currency).toEqual('1234.00');
    });
  });

  describe('invalid formats', () => {
    it('abc', async () => {
      const currency = santizeCurrencyFormat('abc');
      expect(currency).toEqual('abc');
    });

    it(' \'\' ', async () => {
      const currency = santizeCurrencyFormat('');
      expect(currency).toEqual('');
    });

    it('null', async () => {
      const currency = santizeCurrencyFormat(null);
      expect(currency).toEqual('');
    });
  });
});
