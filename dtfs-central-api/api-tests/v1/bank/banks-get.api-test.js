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

  describe('GET /v1/bank', () => {
    it('returns all banks', async () => {
      // Arrange
      const { body: createdBarclaysBank } = await TestApi.post(withoutMongoId(MOCK_BANKS.BARCLAYS)).to('/v1/bank');
      const { body: createdHsbcBank } = await TestApi.post(withoutMongoId(MOCK_BANKS.HSBC)).to('/v1/bank');

      // Act
      const { body, status } = await TestApi.get('/v1/bank');

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
