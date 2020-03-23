const wipeDB = require('../wipeDB');
const aBondCurrency = require('./bond-currency-builder');

const app = require('../../src/createApp');
const { get, post, put, remove } = require('../api')(app);

describe('a bond currency', () => {
  const newBondCurrency = aBondCurrency({ id: 'USD' });
  const updatedBondCurrency = aBondCurrency({
    id: 'USD',
    text: 'Updated currency',
  });

  beforeEach(async () => {
    await wipeDB();
  });

  it('a newly added bond currency is returned when we list all bond currencies', async () => {
    await post(newBondCurrency).to('/api/bond-currencies');

    const {status, body} = await get('/api/bond-currencies');

    expect(status).toEqual(200);
    expect(body.bondCurrencies[0]).toMatchObject(newBondCurrency);
  });

  it('a bond currency can be updated', async () => {
    await post(newBondCurrency).to('/api/bond-currencies');
    await put(updatedBondCurrency).to('/api/bond-currencies/USD');

    const {status, body} = await get('/api/bond-currencies/USD');

    expect(status).toEqual(200);
    expect(body).toMatchObject(updatedBondCurrency);
  });

  it('a bond currency can be deleted', async () => {
    await post(newBondCurrency).to('/api/bond-currencies');
    await remove('/api/bond-currencies/USD');

    const {status, body} = await get('/api/bond-currencies/USD');

    expect(status).toEqual(200);
    expect(body).toMatchObject({});
  });
});
