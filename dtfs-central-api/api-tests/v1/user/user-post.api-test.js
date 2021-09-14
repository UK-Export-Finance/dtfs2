const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);

const newUser = {
  username: 'BANK1_MAKER1',
  firstname: 'Tamil',
  surname: 'Rahani',
  email: 'maker1@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: ['maker'],
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    mga: ['mga_ukef_1.docx', 'mga_ukef_2.docx'],
    emails: [
      'maker1@ukexportfinance.gov.uk',
      'checker1@ukexportfinance.gov.uk',
    ],
    companiesHouseNo: 'UKEF0001',
    partyUrn: '00318345',
  },
};

describe('/v1/user', () => {
  beforeAll(async () => {
    await wipeDB.wipe(['users']);
  });

  describe('POST /v1/user', () => {
    it('creates a user', async () => {
      const { body, status } = await api.post(newUser).to('/v1/user');

      expect(status).toEqual(200);

      expect(body).toEqual({ _id: expect.any(String) });

      const { body: userAfterCreation } = await api.get(`/v1/user/${body._id}`);

      expect(userAfterCreation).toEqual({
        _id: body._id,
        ...newUser,
      });
    });
  });
});
