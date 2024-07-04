const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const { MOCK_BANKS } = require('../../mocks/banks');
const { withoutMongoId } = require('../../../src/helpers/mongodb');
const { testApi } = require('../../test-api');

describe('/v1/bank', () => {
  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.BANKS]);
  });

  describe('GET /v1/bank', () => {
    it('returns all banks', async () => {
      // Arrange
      const { body: createdBarclaysBank } = await testApi.post(withoutMongoId(MOCK_BANKS.BARCLAYS)).to('/v1/bank');
      const { body: createdHsbcBank } = await testApi.post(withoutMongoId(MOCK_BANKS.HSBC)).to('/v1/bank');

      // Act
      const { body, status } = await testApi.get('/v1/bank');

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
