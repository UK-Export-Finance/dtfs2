import { app } from '../../src/createApp';
import { api } from '../api';

const { get } = api(app);

const mockResponses = {
  GBP: {
    status: 200,
    data: [
      {
        id: 344413,
        sourceCurrencyId: 12,
        targetCurrencyId: 12,
        currencyPair: 'GBP-GBP X-RATE',
        bidPrice: 1,
        askPrice: 1,
        lastPrice: 1,
        midPrice: 1,
        created: '2023-05-11T15:27:06.263Z',
        updated: '2023-05-11T15:27:06.263Z',
        effectiveFrom: '2023-05-11T00:00:00.000Z',
        effectiveTo: '9999-12-31T00:00:00.000Z',
      },
    ],
  },
  USD: {
    status: 200,
    data: [
      {
        id: 344336,
        sourceCurrencyId: 12,
        targetCurrencyId: 37,
        currencyPair: 'GBP-USD X-RATE',
        bidPrice: 1.2516,
        askPrice: 1.2518,
        lastPrice: 1.2517,
        midPrice: 1.2517,
        created: '2023-05-11T15:27:06.263Z',
        updated: '2023-05-11T15:27:06.263Z',
        effectiveFrom: '2023-05-11T00:00:00.000Z',
        effectiveTo: '9999-12-31T00:00:00.000Z',
      },
    ],
  },
  EUR: {
    status: 200,
    data: [
      {
        id: 344332,
        sourceCurrencyId: 12,
        targetCurrencyId: 11,
        currencyPair: 'GBP-EUR X-RATE',
        bidPrice: 1.1466,
        askPrice: 1.1468,
        lastPrice: 1.1467,
        midPrice: 1.1467,
        created: '2023-05-11T15:27:06.263Z',
        updated: '2023-05-11T15:27:06.263Z',
        effectiveFrom: '2023-05-11T00:00:00.000Z',
        effectiveTo: '9999-12-31T00:00:00.000Z',
      },
    ],
  },
  JPY: {
    status: 200,
    data: [
      {
        id: 344334,
        sourceCurrencyId: 12,
        targetCurrencyId: 18,
        currencyPair: 'GBP-JPY X-RATE',
        bidPrice: 168.2,
        askPrice: 168.224,
        lastPrice: 168.212,
        midPrice: 168.212,
        created: '2023-05-11T15:27:06.263Z',
        updated: '2023-05-11T15:27:06.263Z',
        effectiveFrom: '2023-05-11T00:00:00.000Z',
        effectiveTo: '9999-12-31T00:00:00.000Z',
      },
    ],
  },
  CAD: {
    status: 200,
    data: [
      {
        id: 344265,
        sourceCurrencyId: 12,
        targetCurrencyId: 5,
        currencyPair: 'GBP-CAD X-RATE',
        bidPrice: 1.6874,
        askPrice: 1.6877,
        lastPrice: 1.6876,
        midPrice: 1.68755,
        created: '2023-05-11T15:27:06.263Z',
        updated: '2023-05-11T15:27:06.263Z',
        effectiveFrom: '2023-05-11T00:00:00.000Z',
        effectiveTo: '9999-12-31T00:00:00.000Z',
      },
    ],
  },
  RON: {
    status: 200,
    data: [
      {
        id: 344319,
        sourceCurrencyId: 12,
        targetCurrencyId: 87,
        currencyPair: 'GBP-RON X-RATE',
        bidPrice: 5.6453,
        askPrice: 5.6561,
        lastPrice: 5.6507,
        midPrice: 5.6507,
        created: '2023-05-11T15:27:06.263Z',
        updated: '2023-05-11T15:27:06.263Z',
        effectiveFrom: '2023-05-11T00:00:00.000Z',
        effectiveTo: '9999-12-31T00:00:00.000Z',
      },
    ],
  },
};

jest.mock('axios', () =>
  jest.fn((args: any) => {
    const { url } = args;

    switch (url) {
      case `${process.env.APIM_MDM_URL}currencies/exchange?source=GBP&target=USD`:
        return Promise.resolve(mockResponses.USD);
      case `${process.env.APIM_MDM_URL}currencies/exchange?source=GBP&target=EUR`:
        return Promise.resolve(mockResponses.EUR);
      case `${process.env.APIM_MDM_URL}currencies/exchange?source=GBP&target=JPY`:
        return Promise.resolve(mockResponses.JPY);
      case `${process.env.APIM_MDM_URL}currencies/exchange?source=GBP&target=CAD`:
        return Promise.resolve(mockResponses.CAD);
      case `${process.env.APIM_MDM_URL}currencies/exchange?source=GBP&target=RON`:
        return Promise.resolve(mockResponses.RON);
      case `${process.env.APIM_MDM_URL}currencies/exchange?source=JPY&target=GBP`:
        return Promise.resolve(mockResponses.JPY);
      case `${process.env.APIM_MDM_URL}currencies/exchange?source=USD&target=GBP`:
        return Promise.resolve(mockResponses.USD);
      case `${process.env.APIM_MDM_URL}currencies/exchange?source=RON&target=GBP`:
        return Promise.resolve(mockResponses.RON);
      default:
        return Promise.resolve(mockResponses.GBP);
    }
  }),
);

describe('/currency-exchange-rate', () => {
  describe('GET /v1/currency-exchange-rate/:source/:target', () => {
    describe('GBP -> X', () => {
      it('GBP -> GBP', async () => {
        const { status, body } = await get(`/currency-exchange-rate/GBP/GBP`);
        expect(status).toEqual(200);
        expect(body.exchangeRate).toEqual(mockResponses.GBP.data[0].midPrice);
      });

      it('GBP -> USD', async () => {
        const { status, body } = await get(`/currency-exchange-rate/GBP/USD`);
        expect(status).toEqual(200);
        expect(body.exchangeRate).toEqual(mockResponses.USD.data[0].midPrice);
      });

      it('GBP -> EUR', async () => {
        const { status, body } = await get(`/currency-exchange-rate/GBP/EUR`);
        expect(status).toEqual(200);
        expect(body.exchangeRate).toEqual(mockResponses.EUR.data[0].midPrice);
      });

      it('GBP -> JPY', async () => {
        const { status, body } = await get(`/currency-exchange-rate/GBP/JPY`);
        expect(status).toEqual(200);
        expect(body.exchangeRate).toEqual(mockResponses.JPY.data[0].midPrice);
      });

      it('GBP -> CAD', async () => {
        const { status, body } = await get(`/currency-exchange-rate/GBP/CAD`);
        expect(status).toEqual(200);
        expect(body.exchangeRate).toEqual(mockResponses.CAD.data[0].midPrice);
      });

      it('GBP -> RON', async () => {
        const { status, body } = await get(`/currency-exchange-rate/GBP/RON`);
        expect(status).toEqual(200);
        expect(body.exchangeRate).toEqual(mockResponses.RON.data[0].midPrice);
      });
    });

    describe('X -> GBP', () => {
      it('USD -> GBP', async () => {
        const { status, body } = await get(`/currency-exchange-rate/USD/GBP`);
        expect(status).toEqual(200);

        const inverted = Number((1 / mockResponses.USD.data[0].midPrice).toFixed(2));
        expect(body.exchangeRate).toEqual(inverted);
      });

      it('JPY -> GBP', async () => {
        const { status, body } = await get(`/currency-exchange-rate/JPY/GBP`);
        expect(status).toEqual(200);

        const inverted = Number((1 / mockResponses.JPY.data[0].midPrice).toFixed(2));
        expect(body.exchangeRate).toEqual(inverted);
      });

      it('EUR -> GBP', async () => {
        const { status, body } = await get(`/currency-exchange-rate/EUR/GBP`);
        expect(status).toEqual(200);

        const inverted = Number((1 / mockResponses.EUR.data[0].midPrice).toFixed(2));
        expect(body.exchangeRate).toEqual(inverted);
      });

      it('CAD -> GBP', async () => {
        const { status, body } = await get(`/currency-exchange-rate/CAD/GBP`);
        expect(status).toEqual(200);

        const inverted = Number((1 / mockResponses.CAD.data[0].midPrice).toFixed(2));
        expect(body.exchangeRate).toEqual(inverted);
      });

      it('RON -> GBP', async () => {
        const { status, body } = await get(`/currency-exchange-rate/RON/GBP`);
        expect(status).toEqual(200);

        const inverted = Number((1 / mockResponses.RON.data[0].midPrice).toFixed(2));
        expect(body.exchangeRate).toEqual(inverted);
      });
    });

    const invalidCurrencyTestCases = [
      ['abc', 'GBP'],
      ['EUR', '123'],
      ['localhost', 'GBP'],
      ['EUR', '127.0.0.1'],
      ['{}', 'GBP'],
      ['EUR', '{}'],
      ['[]', 'GBP'],
      ['EUR', '[]'],
    ];

    describe('Invalid inputs', () => {
      test.each(invalidCurrencyTestCases)('returns a 400 if you provide invalid currencies: %O, %O', async (currencySource, currencyTarget) => {
        const { status, body } = await get(`/currency-exchange-rate/${currencySource}/${currencyTarget}`);

        expect(status).toEqual(400);
        expect(body).toMatchObject({ data: 'Invalid currency provided', status: 400 });
      });
    });
  });
});
