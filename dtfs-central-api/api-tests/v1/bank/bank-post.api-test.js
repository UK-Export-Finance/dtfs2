const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const BANKS = require('../../mocks/banks');
const api = require('../../api')(app);

describe('/v1/bank', () => {
  beforeAll(async () => {
    await wipeDB.wipe(['banks']);
  });

  describe('POST /v1/bank', () => {
    it('creates a bank', async () => {
      const newBank = BANKS.HSBC;

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
