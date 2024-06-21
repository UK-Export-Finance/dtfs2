const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const { testApi } = require('../../test-api');

const newUser = {
  username: 'maker1@ukexportfinance.gov.uk',
  firstname: 'First',
  surname: 'Last',
  salt: '00',
  hash: '01',
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
  isTrusted: true,
  auditRecord: {
    lastUpdatedAt: '2024-05-20T14:59:30.883 +00:00',
    lastUpdatedByPortalUserId: '664b6552a0eb617722732624',
    lastUpdatedByTfmUserId: null,
    lastUpdatedByIsSystem: null,
    noUserLoggedIn: null,
  },
  'user-status': 'active',
};

describe('/v1/user', () => {
  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.USERS]);
  });

  describe('POST /v1/user', () => {
    it('creates a user', async () => {
      const { body, status } = await testApi.post(newUser).to('/v1/user');

      expect(status).toEqual(200);

      expect(body).toEqual({ _id: expect.any(String) });

      const { body: userAfterCreation } = await testApi.get(`/v1/user/${body._id}`);

      expect(userAfterCreation).toEqual({
        _id: body._id,
        ...newUser,
      });
    });
  });
});
