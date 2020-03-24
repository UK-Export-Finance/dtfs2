const wipeDB = require('../wipeDB');
const aCountry = require('./country-builder');

const app = require('../../src/createApp');

const {
  get,
  post,
  put,
  remove,
} = require('../api')(app);

describe('a country', () => {
  const mockCountres = {
    nzl: {
      code: 'NZL',
      name: 'New Zealand',
    },
    hkg: {
      code: 'HKG',
      name: 'Hong Kong',
    },
    dub: {
      code: 'DUB',
      name: 'Country name',
    },
    gbr: {
      code: 'GBR',
      name: 'United Kingdom',
    },
  };

  const newCountry = aCountry({ code: mockCountres.dub.code });
  const updatedCountry = aCountry({
    code: mockCountres.dub.code,
    name: mockCountres.dub.name,
  });

  beforeEach(async () => {
    await wipeDB();
    await post(mockCountres.dub).to('/api/countries');
  });

  it('a newly added country is returned when we list all countries', async () => {
    await post(newCountry).to('/api/countries');

    const { status, body } = await get('/api/countries');
    const addedCountry = body.countries.find((c) => c.code === mockCountres.dub.code);

    expect(status).toEqual(200);
    expect(addedCountry).toMatchObject(newCountry);
  });

  it('a country can be updated', async () => {
    await post(newCountry).to('/api/countries');
    await put(updatedCountry).to('/api/countries/DUB');

    const { status, body } = await get('/api/countries/DUB');

    expect(status).toEqual(200);
    expect(body).toMatchObject(updatedCountry);
  });

  it('a country can be deleted', async () => {
    await post(newCountry).to('/api/countries');
    await remove('/api/countries/DUB');

    const { status, body } = await get('/api/countries/DUB');

    expect(status).toEqual(200);
    expect(body).toMatchObject({});
  });

  it('lists countries in alphabetical order, with GBR as the first country', async () => {
    await post(mockCountres.nzl).to('/api/countries');
    await post(mockCountres.hkg).to('/api/countries');
    await post(mockCountres.gbr).to('/api/countries');

    const { status, body } = await get('/api/countries');

    const expected = [
      mockCountres.gbr,
      mockCountres.dub,
      mockCountres.hkg,
      mockCountres.nzl,
    ];

    expect(status).toEqual(200);
    expect(body.countries).toMatchObject(expected);
  });

});
