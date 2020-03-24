const wipeDB = require('../wipeDB');
const aBondCurrency = require('./bond-currency-builder');

const app = require('../../src/createApp');
const {
  get,
  post,
  put,
  remove,
} = require('../api')(app);

describe('a bond currency', () => {
  const mockBondCurrencies = {
    usd: {
      id: 'USD',
      name: 'USD - US Dollars',
    },
    gbp: {
      id: 'GBP',
      name: 'GBP - UK Sterling',
    },
    cad: {
      id: 'CAD',
      name: 'CAD - Canadian Dollars',
    },
  };

  const newBondCurrency = aBondCurrency({ id: mockBondCurrencies.usd.id });
  const updatedBondCurrency = aBondCurrency({
    id: mockBondCurrencies.usd.id,
    name: mockBondCurrencies.usd.name,
  });

  beforeEach(async () => {
    await wipeDB();
  });

  it('a newly added bond currency is returned when we list all bond currencies', async () => {
    await post(newBondCurrency).to('/api/bond-currencies');

    const { status, body } = await get('/api/bond-currencies');

    expect(status).toEqual(200);
    expect(body.bondCurrencies[0]).toMatchObject(newBondCurrency);
  });

  it('a bond currency can be updated', async () => {
    await post(newBondCurrency).to('/api/bond-currencies');
    await put(updatedBondCurrency).to('/api/bond-currencies/USD');

    const { status, body } = await get('/api/bond-currencies/USD');

    expect(status).toEqual(200);
    expect(body).toMatchObject(updatedBondCurrency);
  });

  it('a bond currency can be deleted', async () => {
    await post(newBondCurrency).to('/api/bond-currencies');
    await remove('/api/bond-currencies/USD');

    const { status, body } = await get('/api/bond-currencies/USD');

    expect(status).toEqual(200);
    expect(body).toMatchObject({});
  });

  it('lists bond currencies in alphabetical order', async () => {
    await post(mockBondCurrencies.usd).to('/api/bond-currencies');
    await post(mockBondCurrencies.gbp).to('/api/bond-currencies');
    await post(mockBondCurrencies.cad).to('/api/bond-currencies');

    const { status, body } = await get('/api/bond-currencies');

    const expected = [
      mockBondCurrencies.cad,
      mockBondCurrencies.gbp,
      mockBondCurrencies.usd,
    ];

    expect(status).toEqual(200);
    expect(body.bondCurrencies).toMatchObject(expected);
  });

});
