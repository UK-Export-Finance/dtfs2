import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import * as wipeDB from '../../wipeDB';
import { testApi } from '../../test-api';

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

describe('/v1/user/:id', () => {
  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.USERS]);
  });

  describe('GET /v1/user/:id', () => {
    it('returns a user', async () => {
      const { body: createdUser } = await testApi.post(newUser).to('/v1/user');

      const { body, status } = await testApi.get(`/v1/user/${createdUser._id}`);

      expect(status).toEqual(200);

      const expected = {
        _id: createdUser._id,
        ...newUser,
      };

      expect(body).toEqual(expected);
    });

    it('returns 404 when there is no user', async () => {
      const { status } = await testApi.get('/v1/user/123456789101');

      expect(status).toEqual(404);
    });
  });
});
