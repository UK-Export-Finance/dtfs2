const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);

const newBank = {
  id: '9',
  name: 'UKEF test bank (Delegated)',
  emails: ['maker1@ukexportfinance.gov.uk', 'checker1@ukexportfinance.gov.uk'],
  companiesHouseNo: 'UKEF0001',
  partyUrn: '00318345',
  mga: ['mga_ukef_1.docx', 'mga_ukef_2.docx'],
};

describe('/v1/bank/:id', () => {
  beforeAll(async () => {
    await wipeDB.wipe(['banks']);
  });

  describe('GET /v1/bank/:id', () => {
    it('returns a bank', async () => {
      const { body: createdBank } = await api.post(newBank).to('/v1/bank');

      const { body, status } = await api.get(`/v1/bank/${newBank.id}`);

      expect(status).toEqual(200);

      const expected = {
        _id: createdBank._id,
        ...newBank,
      };

      expect(body).toEqual(expected);
    });
  });
});
