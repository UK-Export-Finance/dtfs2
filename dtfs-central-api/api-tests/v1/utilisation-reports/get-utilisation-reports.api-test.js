const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const db = require('../../../src/drivers/db-client');
const { DB_COLLECTIONS } = require('../../../src/constants/db-collections');
const { MOCK_UTILISATION_REPORT } = require('../../mocks/utilisation-reports/utilisation-reports');
const { MOCK_BANKS } = require('../../mocks/banks');

const getUrl = (bankId) => `/v1/bank/${bankId}/utilisation-reports`;

describe('GET /v1/bank/:bankId/utilisation-reports', () => {
  beforeAll(async () => {
    await wipeDB.wipe([DB_COLLECTIONS.UTILISATION_REPORTS]);
  });

  it('returns 400 when an invalid bank id is provided', async () => {
    // Act
    const { status, body } = await api.get(getUrl('invalid-mongo-id'));

    // Assert
    expect(status).toEqual(400);
    expect(body.errors.at(0).msg).toEqual("The bank id provided should be a string of numbers");
  });

  it('gets a utilisation report', async () => {
    // Arrange
    const collection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
    const { insertedId } = await collection.insertOne(MOCK_UTILISATION_REPORT);
    const _id = insertedId.toString();
    const dateUploadedAsISOString = MOCK_UTILISATION_REPORT.dateUploaded.toISOString();

    // Act
    const { body, status } = await api.get(getUrl(MOCK_BANKS.HSBC.id));

    // Assert
    expect(status).toEqual(200);

    const expected = [{
      ...MOCK_UTILISATION_REPORT,
      _id,
      dateUploaded: dateUploadedAsISOString,
    }];

    expect(body).toEqual(expected);
  });
});
