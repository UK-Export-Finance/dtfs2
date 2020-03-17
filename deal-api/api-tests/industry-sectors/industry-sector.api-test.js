const wipeDB = require('../wipeDB');
const anIndustrySector = require('./industry-sector-builder');

const app = require('../../src/createApp');

const { get, post, put, remove } = require('../api')(app);

describe('an industry sector', () => {
  const newSector = anIndustrySector({ code: '1066' });
  const updatedSector = anIndustrySector({
    code: '1066',
    name: 'Updated sector name',
  });

  beforeEach(async () => {
    await wipeDB();
  });

  it('a newly added industry sector is returned when we list all industry sectors', async () => {
    await post(newSector).to('/api/industry-sectors');

    const industrySectorList = await get('/api/industry-sectors');
    expect(industrySectorList.industrySectors[0]).toMatchObject(newSector);
  });

  it('an industry sector can be updated', async () => {
    await post(newSector).to('/api/industry-sectors');
    await put(updatedSector).to('/api/industry-sectors/1066');

    const sector = await get('/api/industry-sectors/1066');
    expect(sector).toMatchObject(updatedSector);
  });

  it('an industry sector can be deleted', async () => {
    await post(newSector).to('/api/industry-sectors');
    await remove('/api/industry-sectors/1066');

    const sector = await get('/api/industry-sectors/1066');
    expect(sector).toMatchObject({});
  });
});
