const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);

const newBank = {
  id: '9',
  name: 'UKEF test bank (Delegated)',
  emails: [
    'maker1@ukexportfinance.gov.uk',
    'checker1@ukexportfinance.gov.uk',
  ],
  companiesHouseNo: 'UKEF0001',
  partyUrn: '00318345',
  mga: [
    'mga_ukef_1.docx',
    'mga_ukef_2.docx',
  ],
};

describe('/v1/bank/:id', () => {
  beforeEach(async () => {
    await wipeDB.wipe(['banks']);
  });

  describe('POST /v1/bank', () => {
    it('creates a bank', async () => {
      const { body, status } = await api.post(newBank).to('/v1/portal/banks');

      expect(status).toEqual(200);

      expect(body).toEqual({ _id: expect.any(String) });

      const { body: bankAfterCreation } = await api.get(`/v1/portal/banks/${newBank.id}`);

      expect(bankAfterCreation).toEqual({
        _id: body._id,
        ...newBank,
      });
    });
  });

  describe('GET /v1/bank/:id', () => {
    it('returns a bank', async () => {
      const { body: createdBank } = await api.post(newBank).to('/v1/portal/banks');

      const { body, status } = await api.get(`/v1/portal/banks/${newBank.id}`);

      expect(status).toEqual(200);

      const expected = {
        _id: createdBank._id,
        ...newBank,
      };

      expect(body).toEqual(expected);
    });
  });
});
