const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const { MOCK_BANKS } = require('../../mocks/banks');
const { withoutMongoId } = require('../../../src/helpers/mongodb');
const { TestApi } = require('../../test-api');

describe('/v1/bank/:id', () => {
  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.BANKS]);
  });

  describe('GET /v1/bank/:id', () => {
    it('returns a bank', async () => {
      const newBank = withoutMongoId(MOCK_BANKS.HSBC);

      const { body: createdBank } = await TestApi.post(newBank).to('/v1/bank');

      const { body, status } = await TestApi.get(`/v1/bank/${newBank.id}`);

      expect(status).toEqual(200);

      const expected = {
        _id: createdBank._id,
        ...newBank,
      };

      expect(body).toEqual(expected);
    });
  });
});
