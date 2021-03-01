const axios = require('axios');
const app = require('../../src/createApp');
const { get } = require('../api')(app);

const mockSource = 'USD';
const mockTarget = 'GBP';

const mockResponse = {
  status: 200,
  data: [
    {
      id: 258671,
      sourceCurrencyId: 37,
      targetCurrencyId: 12,
      currencyPair: 'USD-GBP X-RATE',
      bidPrice: 0.729820464165815,
      askPrice: 0.72976720426184,
      lastPrice: 0.72976720426184,
      midPrice: 0.729793833242109,
      created: '2021-01-27T16:21:32',
      updated: '2021-01-27T16:21:32',
      effectiveTo: '9999-12-31T00:00:00',
      effectiveFrom: '2021-01-27T00:00:00'
    },
  ],
};

jest.mock('axios', () => jest.fn((args) => {
  const { method, url } = args;

  if (method === 'get') {
    if (url === `${process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_URL}?source=${mockSource}&target=${mockTarget}`) {
      return Promise.resolve(mockResponse);
    }
  }
}));

describe('/currency-exchange-rate', () => {
  describe('GET /v1/currency-exchange-rate/:source/:target', () => {
    it('should return data', async () => {
      const { status, body } = await get(`/currency-exchange-rate/${mockSource}/${mockTarget}`);

      expect(status).toEqual(200);
      expect(body).toEqual(mockResponse.data[0]);
    });
  });
});
