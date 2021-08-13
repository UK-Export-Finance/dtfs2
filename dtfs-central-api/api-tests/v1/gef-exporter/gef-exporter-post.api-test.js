const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);

const newExporter = {
  companyName: 'Testing',
  companiesHouseRegistrationNumber: '12345678',
};

describe('/v1/portal/gef/exporter', () => {
  beforeAll(async () => {
    await wipeDB.wipe(['gef-exporter']);
  });

  describe('POST /v1/portal/gef/exporter', () => {
    it('returns the created exporter ', async () => {
      const { body, status } = await api.post(newExporter).to('/v1/portal/gef/exporter');

      expect(status).toEqual(200);

      const expected = {
        _id: expect.any(String),
        ...newExporter,
      };

      expect(body).toEqual(expected);
    });
  });
});
