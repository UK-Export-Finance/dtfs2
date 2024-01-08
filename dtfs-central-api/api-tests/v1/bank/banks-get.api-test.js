const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const { MOCK_BANKS } = require('../../mocks/banks');
const { DB_COLLECTIONS } = require('../../../src/constants');
const api = require('../../api')(app);

describe('/v1/bank', () => {
  beforeAll(async () => {
    await wipeDB.wipe([DB_COLLECTIONS.BANKS]);
  });

  describe('GET /v1/bank', () => {
    it('returns all banks', async () => {
      // Arrange
      const { body: createdBarclaysBank } = await api.post(MOCK_BANKS.BARCLAYS).to('/v1/bank');
      const { body: createdHsbcBank } = await api.post(MOCK_BANKS.HSBC).to('/v1/bank');

      // Act
      const { body, status } = await api.get('/v1/bank');

      // Assert
      expect(status).toEqual(200);

      const expectedBody = [
        {
          ...MOCK_BANKS.BARCLAYS,
          _id: createdBarclaysBank._id,
        },
        {
          ...MOCK_BANKS.HSBC,
          _id: createdHsbcBank._id,
        },
      ];

      expect(body).toEqual(expectedBody);
    });
  });
});
