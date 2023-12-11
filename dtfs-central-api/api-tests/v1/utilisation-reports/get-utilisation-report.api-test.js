const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const db = require('../../../src/drivers/db-client');
const { DB_COLLECTIONS } = require('../../../src/constants/dbCollections');
const { MOCK_UTILISATION_REPORT } = require('../../mocks/utilisation-reports');

const getUrl = (_id) => `/v1/utilisation-reports/${_id}`;

describe('/v1/utilisation-reports/:_id', () => {
  beforeAll(async () => {
    await wipeDB.wipe([DB_COLLECTIONS.UTILISATION_REPORTS]);
  });

  describe('GET /v1/utilisation-reports/:_id', () => {
    it('returns 400 when an invalid report MongoDB ID is provided', async () => {
      // Act
      const { status, body } = await api.get(getUrl('invalid-mongo-id'));

      // Assert
      expect(status).toEqual(400);
      expect(body).toEqual("Invalid MongoDB '_id' path param provided");
    });

    it('gets a utilisation report', async () => {
      // Arrange
      const collection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
      const { insertedId } = await collection.insertOne(MOCK_UTILISATION_REPORT);

      // Act
      const { body, status } = await api.get(getUrl(insertedId.toString()));

      // Assert
      expect(status).toEqual(200);

      const expected = {
        _id: insertedId,
        ...MOCK_UTILISATION_REPORT,
      };

      expect(body).toEqual(expected);
    });
  });
});
