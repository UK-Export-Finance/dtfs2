const wipeDB = require('../wipeDB');
const aMandatoryCriteria = require('./mandatory-criteria-builder');

const app = require('../../src/createApp');

const { get, post, put, remove } = require('../api')(app);

describe('a mandatory criteria', () => {
  const newMandatoryCriteria = aMandatoryCriteria({ id: '2' });
  const updatedMandatoryCriteria = aMandatoryCriteria({
    id: '2',
    title: 'Updated mandatory criteria',
  });

  beforeEach(async () => {
    await wipeDB();
  });

  it('a newly added mandatory criteria is returned when we list all mandatory criteria', async () => {
    await post(newMandatoryCriteria).to('/api/mandatory-criteria');

    const mandatoryCriteriaList = await get('/api/mandatory-criteria');
    expect(mandatoryCriteriaList.mandatoryCriteria[0]).toMatchObject(newMandatoryCriteria);
  });

  it('a mandatory criteria can be updated', async () => {
    await post(newMandatoryCriteria).to('/api/mandatory-criteria');
    await put(updatedMandatoryCriteria).to('/api/mandatory-criteria/2');

    const mandatoryCriteria = await get('/api/mandatory-criteria/2');
    expect(mandatoryCriteria).toMatchObject(updatedMandatoryCriteria);
  });

  it('a mandatory criteria can be deleted', async () => {
    await post(newMandatoryCriteria).to('/api/mandatory-criteria');
    await remove('/api/mandatory-criteria/2');

    const mandatoryCriteria = await get('/api/mandatory-criteria/2');
    expect(mandatoryCriteria).toMatchObject({});
  });
});
