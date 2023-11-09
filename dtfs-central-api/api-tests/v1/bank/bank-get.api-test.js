const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const BANKS = require('../../mocks/banks');
const api = require('../../api')(app);

describe('/v1/bank/:id', () => {
  beforeAll(async () => {
    await wipeDB.wipe(['banks']);
  });

  describe('GET /v1/bank/:id', () => {
    it('returns a bank', async () => {
      const newBank = BANKS.HSBC;

      const { body: createdBank } = await api.post(newBank).to('/v1/bank');

      const { body, status } = await api.get(`/v1/bank/${newBank.id}`);

      expect(status).toEqual(200);

      const expected = {
        _id: createdBank._id,
        ...newBank,
      };

      expect(body).toEqual(expected);
    });
  });
});
