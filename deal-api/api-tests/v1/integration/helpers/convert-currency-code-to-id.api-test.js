const convertCurrencyCodeToId = require('../../../../src/v1/controllers/integration/helpers/convert-currency-code-to-id');
const currencyController = require('../../../../src/v1/controllers/currencies.controller');

currencyController.findOneCurrency = jest.fn((code) => {
  if (code === 'GBP') {
    return {
      currencyId: 12,
    };
  }
});

describe('converts currency code to id', () => {
  it('converts valid currency code', async () => {
    const currencyId = await convertCurrencyCodeToId('GBP');
    expect(currencyController.findOneCurrency).toHaveBeenCalledWith('GBP');
    expect(currencyId).toEqual(12);
  });

  it('returns original value if code not found', async () => {
    const currencyId = await convertCurrencyCodeToId('XXX');
    expect(currencyId).toEqual('XXX');
  });
});
