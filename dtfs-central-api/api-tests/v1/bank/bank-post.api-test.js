const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const { MOCK_BANKS } = require('../../mocks/banks');
const { withoutMongoId } = require('../../../src/helpers/mongodb');
const { TestApi } = require('../../test-api');

describe('/v1/bank', () => {
  beforeAll(async () => {
    await TestApi.initialise();

    await wipeDB.wipe([MONGO_DB_COLLECTIONS.BANKS]);
  });

  describe('POST /v1/bank', () => {
    it('creates a bank', async () => {
      const newBank = withoutMongoId(MOCK_BANKS.HSBC);

      const { body, status } = await TestApi.post(newBank).to('/v1/bank');

      expect(status).toEqual(200);

      expect(body).toEqual({ _id: expect.any(String) });

      const { body: bankAfterCreation } = await TestApi.get(`/v1/bank/${newBank.id}`);

      expect(bankAfterCreation).toEqual({
        _id: body._id,
        ...newBank,
      });
    });
  });
});
