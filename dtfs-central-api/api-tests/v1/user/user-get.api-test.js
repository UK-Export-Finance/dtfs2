const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);

const newUser = {
  username: 'maker1@ukexportfinance.gov.uk',
  firstname: 'First',
  surname: 'Last',
  password: '',
  email: 'maker1@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: ['maker'],
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    mga: ['mga_ukef_1.docx', 'mga_ukef_2.docx'],
    emails: ['maker1@ukexportfinance.gov.uk', 'checker1@ukexportfinance.gov.uk'],
    companiesHouseNo: 'UKEF0001',
    partyUrn: '00318345',
  },
};

describe('/v1/user/:id', () => {
  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.USERS]);
  });

  describe('GET /v1/user/:id', () => {
    it('returns a user', async () => {
      const { body: createdUser } = await api.post(newUser).to('/v1/user');

      const { body, status } = await api.get(`/v1/user/${createdUser._id}`);

      expect(status).toEqual(200);

      const expected = {
        _id: createdUser._id,
        ...newUser,
      };

      expect(body).toEqual(expected);
    });

    it('returns 404 when there is no user', async () => {
      const { status } = await api.get('/v1/user/123456789101');

      expect(status).toEqual(404);
    });
  });
});
