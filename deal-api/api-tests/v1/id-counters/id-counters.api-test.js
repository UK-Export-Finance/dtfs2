const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const wipeDB = require('../../wipeDB');

const { as } = require('../../api')(app);

const expectedCounters = [
  { _id: 'DEAL_COUNTER', count: 1000000 },
  { _id: 'FACILITY_COUNTER', count: 1000000 },
];

describe('/v1/counters/reset', () => {
  let aDataAdmin;
  let aNonDataAdmin;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aDataAdmin = testUsers().withRole('data-admin').one();
    aNonDataAdmin = testUsers().withoutRole('data-admin').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['idCounters']);
  });

  describe('GET /v1/counters/reset', () => {
    it('GET route does not exist', async () => {
      const { status } = await as().get('/v1/counters/reset');
      expect(status).toEqual(401);
    });
  });

  describe('POST /v1/counters/reset', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post({}).to('/v1/counters/reset');
      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "data-admin" role', async () => {
      const { status } = await as(aNonDataAdmin).post({}).to('/v1/counters/reset');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "data-admin" role', async () => {
      const { body, status } = await as(aDataAdmin).post({}).to('/v1/counters/reset');

      expect(status).toEqual(200);
      expect(body).toMatchObject(expectedCounters);
    });
  });
});
