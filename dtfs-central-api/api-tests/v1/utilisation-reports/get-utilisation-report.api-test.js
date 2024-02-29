const app = require('../../../src/createApp');
const api = require('../../api')(app);
const { MOCK_BANKS } = require('../../mocks/banks');

const getUrl = (id) => `/v1/utilisation-reports/${id}`;

describe('/v1/utilisation-reports/:id', () => {
  describe('GET /v1/utilisation-reports/:_id', () => {
    it('returns 400 when an invalid report ID is provided', async () => {
      // Act
      const { status, body } = await api.get(getUrl('invalid-id'));

      // Assert
      expect(status).toEqual(400);
      expect(body.errors.at(0).msg).toEqual("Invalid 'id' path param provided");
    });

    it('gets a utilisation report', async () => {
      // Act
      const { status } = await api.get(getUrl(MOCK_BANKS.BARCLAYS.id));

      // Assert
      expect(status).toEqual(200);
    });
  });
});
