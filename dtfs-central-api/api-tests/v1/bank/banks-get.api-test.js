const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const BANKS = require('../../mocks/banks');
const api = require('../../api')(app);

describe('/v1/bank', () => {
  beforeAll(async () => {
    await wipeDB.wipe(['banks']);
  });

  describe('GET /v1/bank', () => {
    it('returns all banks', async () => {
      // Arrange
      const { body: createdBarclaysBank } = await api.post(BANKS.BARCLAYS).to('/v1/bank');
      const { body: createdHsbcBank } = await api.post(BANKS.HSBC).to('/v1/bank');

      // Act
      const { body, status } = await api.get('/v1/bank');

      // Assert
      expect(status).toEqual(200);

      const expectedBody = [
        {
          _id: createdBarclaysBank._id,
          ...BANKS.BARCLAYS,
        },
        {
          _id: createdHsbcBank._id,
          ...BANKS.HSBC,
        },
      ];

      expect(body).toEqual(expectedBody);
    });
  });
});
