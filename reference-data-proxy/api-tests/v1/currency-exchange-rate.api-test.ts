import { app } from '../../src/createApp';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { get } = require('../api')(app);

const mockResponses = {
  GBPToUSD: {
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
  GBPToEUR: {
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
  GBPToJPY: {
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
  GBPtoCAD: {
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
  JPYToGBP: {
    status: 200,
    data: [
      {
        id: 344416,
        sourceCurrencyId: 18,
        targetCurrencyId: 12,
        currencyPair: 'JPY-GBP TEST-RATE',
        bidPrice: 0.077,
        askPrice: 0.099,
        lastPrice: 0.088,
        midPrice: 0.088,
        created: '2023-05-10T15:27:05.057Z',
        updated: '2023-05-10T15:27:05.057Z',
        effectiveFrom: '2023-05-10T00:00:00.000Z',
        effectiveTo: '9999-12-31T00:00:00.000Z',
      },
    ],
  },
  USDToGBP: {
    status: 200,
    data: [
      {
        id: 344358,
        sourceCurrencyId: 37,
        targetCurrencyId: 12,
        currencyPair: 'USD-GBP X-RATE',
        bidPrice: 0.7989,
        askPrice: 0.799,
        lastPrice: 0.7989,
        midPrice: 0.79895,
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
        return Promise.resolve(mockResponses.GBPToUSD);
      case `${process.env.APIM_MDM_URL}currencies/exchange?source=GBP&target=EUR`:
        return Promise.resolve(mockResponses.GBPToEUR);
      case `${process.env.APIM_MDM_URL}currencies/exchange?source=GBP&target=JPY`:
        return Promise.resolve(mockResponses.GBPToJPY);
      case `${process.env.APIM_MDM_URL}currencies/exchange?source=GBP&target=CAD`:
        return Promise.resolve(mockResponses.GBPtoCAD);
      case `${process.env.APIM_MDM_URL}currencies/exchange?source=JPY&target=GBP`:
        return Promise.resolve(mockResponses.JPYToGBP);
      case `${process.env.APIM_MDM_URL}currencies/exchange?source=USD&target=GBP`:
        return Promise.resolve(mockResponses.USDToGBP);
      default:
        return Promise.resolve(mockResponses.GBPToUSD);
    }
  }),
);

describe('/currency-exchange-rate', () => {
  describe('GET /v1/currency-exchange-rate/:source/:target', () => {
    describe('GBP -> X', () => {
      it('GBP -> USD', async () => {
        const { status, body } = await get(`/currency-exchange-rate/GBP/USD`);
        expect(status).toEqual(200);
        expect(body.exchangeRate).toEqual(mockResponses.GBPToUSD.data[0].midPrice);
      });

      it('GBP -> EUR', async () => {
        const { status, body } = await get(`/currency-exchange-rate/GBP/EUR`);
        expect(status).toEqual(200);
        expect(body.exchangeRate).toEqual(mockResponses.GBPToEUR.data[0].midPrice);
      });

      it('GBP -> JPY', async () => {
        const { status, body } = await get(`/currency-exchange-rate/GBP/JPY`);
        expect(status).toEqual(200);
        expect(body.exchangeRate).toEqual(mockResponses.GBPToJPY.data[0].midPrice);
      });

      it('GBP -> CAD', async () => {
        const { status, body } = await get(`/currency-exchange-rate/GBP/CAD`);
        expect(status).toEqual(200);
        expect(body.exchangeRate).toEqual(mockResponses.GBPtoCAD.data[0].midPrice);
      });
    });

    describe('X -> GBP', () => {
      it('USD -> GBP', async () => {
        const { status, body } = await get(`/currency-exchange-rate/USD/GBP`);
        expect(status).toEqual(200);
        expect(body.exchangeRate).toEqual(mockResponses.USDToGBP.data[0].midPrice);
      });

      it('JPY -> GBP', async () => {
        const { status, body } = await get(`/currency-exchange-rate/JPY/GBP`);
        expect(status).toEqual(200);
        expect(body.exchangeRate).toEqual(mockResponses.JPYToGBP.data[0].midPrice);
      });
    });
  });
});
