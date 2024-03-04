const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const { MOCK_BANKS } = require('../../mocks/banks');
const api = require('../../api')(app);

describe('/v1/utilisation-reports/reconciliation-summary/:submissionMonth', () => {
  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.BANKS]);
    await api.post(MOCK_BANKS.BARCLAYS).to('/v1/bank');
  });

  describe('GET /v1/utilisation-reports/reconciliation-summary/:submissionMonth', () => {
    it('returns a 200 response when the submissionMonth is a valid ISO month', async () => {
      // Arrange
      const submissionMonth = '2023-11';

      // Act
      const { status } = await api.get(`/v1/utilisation-reports/reconciliation-summary/${submissionMonth}`);

      // Assert
      expect(status).toEqual(200);
    });

    it('returns a 400 response when the submissionMonth is not a valid ISO month', async () => {
      // Arrange
      const submissionMonth = 'invalid';

      // Act
      const { status } = await api.get(`/v1/utilisation-reports/reconciliation-summary/${submissionMonth}`);

      // Assert
      expect(status).toEqual(400);
    });
  });
});
