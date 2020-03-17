const wipeDB = require('../wipeDB');
const aCountry = require('./country-builder');

const app = require('../../src/createApp');

const {get, post, put, remove} = require('../api')(app);

describe('a country', () => {
  const newCountry = aCountry({ code: 'DUB' });
  const updatedCountry = aCountry({
    code: 'DUB',
    name: 'Updated country name',
  });

  beforeEach(async () => {
    await wipeDB();
  });

  it('a newly added country is returned when we list all countries', async () => {
    await post(newCountry).to('/api/countries');

    const countries = await get('/api/countries');
    expect(countries[0]).toMatchObject(newCountry);
  });

  it('a country can be updated', async () => {
    await post(newCountry).to('/api/countries');
    await put(updatedCountry).to('/api/countries/DUB');

    const country = await get('/api/countries/DUB');
    expect(country).toMatchObject(updatedCountry);
  });

  it('a country can be deleted', async () => {
    await post(newCountry).to('/api/countries');
    await remove('/api/countries/DUB');

    const country = await get('/api/countries/DUB');
    expect(country).toMatchObject({});
  });
});
