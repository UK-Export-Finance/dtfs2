import { app } from '../../src/createApp';
const { get } = require('../api')(app);

const mockResponses = {
  GBPToUSD: {
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
        effectiveFrom: '2021-01-27T00:00:00',
      },
    ],
  },
  GBPtoCAD: {
    status: 200,
    data: [
      {
        id: 258603,
        sourceCurrencyId: 12,
        targetCurrencyId: 5,
        currencyPair: 'GBP-CAD X-RATE',
        bidPrice: 1.7505,
        askPrice: 1.7507,
        lastPrice: 1.7506,
        midPrice: 1.7506,
        created: '2021-01-27T16:21:32',
        updated: '2021-01-27T16:21:32',
        effectiveTo: '9999-12-31T00:00:00',
        effectiveFrom: '2021-01-27T00:00:00',
      },
    ],
  },
};

jest.mock('axios', () =>
  jest.fn((args: any) => {
    const { method, url } = args;

    if (method === 'get') {
      if (url === `${process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_URL}?source=GBP&target=USD`) {
        return Promise.resolve(mockResponses.GBPToUSD);
      }

      if (url === `${process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_URL}?source=GBP&target=CAD`) {
        return Promise.resolve(mockResponses.GBPtoCAD);
      }
    }
  }),
);

describe('/currency-exchange-rate', () => {
  describe('GET /v1/currency-exchange-rate/:source/:target', () => {
    describe('when source is GBP', () => {
      it('should return midPrice', async () => {
        const { status, body } = await get(`/currency-exchange-rate/GBP/CAD`);
        expect(status).toEqual(200);
        expect(body.midPrice).toEqual(mockResponses.GBPtoCAD.data[0].midPrice);
      });
    });

    describe('when source is NOT GBP', () => {
      it('should swap the source and target and return midPrice calculation', async () => {
        const { status, body } = await get(`/currency-exchange-rate/USD/GBP`);
        expect(status).toEqual(200);
        const expected = 1 / mockResponses.GBPToUSD.data[0].midPrice;
        expect(body).toEqual({ midPrice: expected });
      });
    });
  });
});
