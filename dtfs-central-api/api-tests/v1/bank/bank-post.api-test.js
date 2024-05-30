const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const { MOCK_BANKS } = require('../../mocks/banks');
const { withoutMongoId } = require('../../../src/helpers/mongodb');
const api = require('../../api')(app);

describe('/v1/bank', () => {
  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.BANKS]);
  });

  describe('POST /v1/bank', () => {
    it('creates a bank', async () => {
      const newBank = withoutMongoId(MOCK_BANKS.HSBC);

      const { body, status } = await api.post(newBank).to('/v1/bank');

      expect(status).toEqual(200);

      expect(body).toEqual({ _id: expect.any(String) });

      const { body: bankAfterCreation } = await api.get(`/v1/bank/${newBank.id}`);

      expect(bankAfterCreation).toEqual({
        _id: body._id,
        ...newBank,
      });
    });
  });
});
