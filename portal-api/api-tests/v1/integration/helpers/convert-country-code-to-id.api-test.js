const convertCountryCodeToId = require('../../../../src/v1/controllers/integration/helpers/convert-country-code-to-id');
const countryController = require('../../../../src/v1/controllers/countries.controller');

countryController.findOneCountry = jest.fn((code) => {
  if (code === 'GBR') {
    return {
      id: 826,
    };
  }
});

describe('converts country code to id', () => {
  it('converts valid country code', async () => {
    const currencyId = await convertCountryCodeToId('GBR');
    expect(countryController.findOneCountry).toHaveBeenCalledWith('GBR');
    expect(currencyId).toEqual(826);
  });

  it('returns original value if code not found', async () => {
    const currencyId = await convertCountryCodeToId('XXX');
    expect(currencyId).toEqual('XXX');
  });
});
