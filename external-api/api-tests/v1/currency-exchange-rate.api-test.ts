import { app } from '../../src/createApp';
import { api } from '../api';
import MockAdapter from 'axios-mock-adapter';
import axios, { HttpStatusCode } from 'axios';

const { APIM_MDM_URL } = process.env;
const { get } = api(app);

// Mock Axios
const mock = new MockAdapter(axios);

// Mock responses
const mockResponses = {
  GBP: {
    status: HttpStatusCode.Ok,
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
    status: HttpStatusCode.Ok,
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
    status: HttpStatusCode.Ok,
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
    status: HttpStatusCode.Ok,
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
    status: HttpStatusCode.Ok,
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
    status: HttpStatusCode.Ok,
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

// Mock arguments
const currencies = [
  'source=GBP&target=GBP',
  'source=GBP&target=USD',
  'source=GBP&target=EUR',
  'source=GBP&target=JPY',
  'source=GBP&target=CAD',
  'source=GBP&target=RON',
  'source=JPY&target=GBP',
  'source=USD&target=GBP',
  'source=RON&target=GBP',
];

// Mock responses
const response = (endpoint: string) => {
  switch (endpoint) {
    case 'source=GBP&target=USD':
      return mockResponses.USD.data;
    case 'source=GBP&target=EUR':
      return mockResponses.EUR.data;
    case 'source=GBP&target=JPY':
      return mockResponses.JPY.data;
    case 'source=GBP&target=CAD':
      return mockResponses.CAD.data;
    case 'source=GBP&target=RON':
      return mockResponses.RON.data;
    case 'source=JPY&target=GBP':
      return mockResponses.JPY.data;
    case 'source=USD&target=GBP':
      return mockResponses.USD.data;
    case 'source=RON&target=GBP':
      return mockResponses.RON.data;
    default:
      return mockResponses.GBP.data;
  }
};

// Send mock responses
currencies.forEach((currency) => {
  const url = `${APIM_MDM_URL}currencies/exchange?${currency}`;
  mock.onGet(url).reply(HttpStatusCode.Ok, response(currency));
});

describe('/currency-exchange-rate', () => {
  describe('GET /v1/currency-exchange-rate/:source/:target', () => {
    describe('GBP -> X', () => {
      it('GBP -> GBP', async () => {
        const { status, body } = await get(`/currency-exchange-rate/GBP/GBP`);
        expect(status).toEqual(HttpStatusCode.Ok);
        expect(body.exchangeRate).toEqual(mockResponses.GBP.data[0].midPrice);
      });

      it('GBP -> USD', async () => {
        const { status, body } = await get(`/currency-exchange-rate/GBP/USD`);
        expect(status).toEqual(HttpStatusCode.Ok);
        expect(body.exchangeRate).toEqual(mockResponses.USD.data[0].midPrice);
      });

      it('GBP -> EUR', async () => {
        const { status, body } = await get(`/currency-exchange-rate/GBP/EUR`);
        expect(status).toEqual(HttpStatusCode.Ok);
        expect(body.exchangeRate).toEqual(mockResponses.EUR.data[0].midPrice);
      });

      it('GBP -> JPY', async () => {
        const { status, body } = await get(`/currency-exchange-rate/GBP/JPY`);
        expect(status).toEqual(HttpStatusCode.Ok);
        expect(body.exchangeRate).toEqual(mockResponses.JPY.data[0].midPrice);
      });

      it('GBP -> CAD', async () => {
        const { status, body } = await get(`/currency-exchange-rate/GBP/CAD`);
        expect(status).toEqual(HttpStatusCode.Ok);
        expect(body.exchangeRate).toEqual(mockResponses.CAD.data[0].midPrice);
      });

      it('GBP -> RON', async () => {
        const { status, body } = await get(`/currency-exchange-rate/GBP/RON`);
        expect(status).toEqual(HttpStatusCode.Ok);
        expect(body.exchangeRate).toEqual(mockResponses.RON.data[0].midPrice);
      });
    });

    describe('X -> GBP', () => {
      it('USD -> GBP', async () => {
        const { status, body } = await get(`/currency-exchange-rate/USD/GBP`);
        expect(status).toEqual(HttpStatusCode.Ok);

        const inverted = Number((1 / mockResponses.USD.data[0].midPrice).toFixed(2));
        expect(body.exchangeRate).toEqual(inverted);
      });

      it('JPY -> GBP', async () => {
        const { status, body } = await get(`/currency-exchange-rate/JPY/GBP`);
        expect(status).toEqual(HttpStatusCode.Ok);

        const inverted = Number((1 / mockResponses.JPY.data[0].midPrice).toFixed(2));
        expect(body.exchangeRate).toEqual(inverted);
      });

      it('EUR -> GBP', async () => {
        const { status, body } = await get(`/currency-exchange-rate/EUR/GBP`);
        expect(status).toEqual(HttpStatusCode.Ok);

        const inverted = Number((1 / mockResponses.EUR.data[0].midPrice).toFixed(2));
        expect(body.exchangeRate).toEqual(inverted);
      });

      it('CAD -> GBP', async () => {
        const { status, body } = await get(`/currency-exchange-rate/CAD/GBP`);
        expect(status).toEqual(HttpStatusCode.Ok);

        const inverted = Number((1 / mockResponses.CAD.data[0].midPrice).toFixed(2));
        expect(body.exchangeRate).toEqual(inverted);
      });

      it('RON -> GBP', async () => {
        const { status, body } = await get(`/currency-exchange-rate/RON/GBP`);
        expect(status).toEqual(HttpStatusCode.Ok);

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
      test.each(invalidCurrencyTestCases)('returns a 400 if you provide invalid currencies: %s, %s', async (currencySource, currencyTarget) => {
        const { status, body } = await get(`/currency-exchange-rate/${currencySource}/${currencyTarget}`);

        expect(status).toEqual(HttpStatusCode.BadRequest);
        expect(body).toMatchObject({ data: 'Invalid currency provided', status: HttpStatusCode.BadRequest });
      });
    });
  });
});
