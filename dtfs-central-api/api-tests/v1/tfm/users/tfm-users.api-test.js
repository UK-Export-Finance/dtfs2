const { ObjectId } = require('mongodb');
const { MONGO_DB_COLLECTIONS, AUDIT_USER_TYPES } = require('@ukef/dtfs2-common');
const { generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { withDeleteOneTests, generateMockTfmUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const wipeDB = require('../../../wipeDB');
const { testApi } = require('../../../test-api');
const { withValidateAuditDetailsTests } = require('../../../helpers/with-validate-audit-details.api-tests');
const { expectMongoIds } = require('../../../expectMongoIds');
const { MOCK_TFM_USER } = require('../../../mocks/test-users/mock-tfm-user');

const mockUsers = [
  {
    username: 'T1_USER_1',
    email: 'T1_USER_1@ukexportfinance.gov.uk',
    salt: '00',
    hash: '01',
    teams: ['TEAM1'],
    timezone: 'Europe/London',
    firstName: 'Joe',
    lastName: 'Bloggs',
    status: 'active',
  },
  {
    username: 'T1_USER_2',
    email: 'T1_USER_2@ukexportfinance.gov.uk',
    salt: '00',
    hash: '01',
    teams: ['TEAM1'],
    timezone: 'Europe/London',
    firstName: 'Joe',
    lastName: 'Bloggs',
    status: 'active',
  },
  {
    username: 'T1_USER_3',
    email: 'T1_USER_3@ukexportfinance.gov.uk',
    salt: '00',
    hash: '01',
    teams: ['TEAM2'],
    timezone: 'Europe/London',
    firstName: 'Joe',
    lastName: 'Bloggs',
    status: 'active',
  },
];

const orderUsers = (users) => users.sort((u1, u2) => u1.username.localeCompare(u2.username));

describe('/v1/tfm/users', () => {
  beforeEach(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_USERS]);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('POST /v1/tfm/users', () => {
    withValidateAuditDetailsTests({
      makeRequest: (auditDetails) => testApi.post({ user: mockUsers[0], auditDetails }).to('/v1/tfm/users'),
      validUserTypes: [AUDIT_USER_TYPES.TFM],
    });

    it('returns the created resource', async () => {
      const { status, body } = await testApi.post({ user: mockUsers[0], auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to('/v1/tfm/users');

      expect(status).toEqual(200);
      expect(typeof body._id).toEqual('string');
    });
  });

  describe('GET /v1/tfm/users', () => {
    it('returns all users', async () => {
      await Promise.all(
        mockUsers.map(async (mockUser) => testApi.post({ user: mockUser, auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to('/v1/tfm/users')),
      );
      const { status, body } = await testApi.get('/v1/tfm/users');
      expect(status).toEqual(200);
      expect(orderUsers(body.users)).toMatchObject(
        orderUsers(
          expectMongoIds(
            mockUsers.map((mockUser) => ({
              ...mockUser,
              auditRecord: {
                lastUpdatedAt: expect.any(String),
                lastUpdatedByTfmUserId: MOCK_TFM_USER._id,
                lastUpdatedByPortalUserId: null,
                lastUpdatedByIsSystem: null,
                noUserLoggedIn: null,
              },
            })),
          ),
        ),
      );
    });
  });

  describe('GET /v1/tfm/users/:username', () => {
    it('404s requests for unknown usernames', async () => {
      const { status } = await testApi.get('/v1/tfm/users/unit-test');
      expect(status).toEqual(404);
    });

    it('returns the requested resource', async () => {
      await testApi.post({ user: mockUsers[0], auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to('/v1/tfm/users');
      const { status, body } = await testApi.get(`/v1/tfm/users/${mockUsers[0].username}`);

      expect(status).toEqual(200);
      expect(body).toMatchObject({
        ...mockUsers[0],
        auditRecord: {
          lastUpdatedAt: expect.any(String),
          lastUpdatedByTfmUserId: MOCK_TFM_USER._id,
          lastUpdatedByPortalUserId: null,
          lastUpdatedByIsSystem: null,
          noUserLoggedIn: null,
        },
      });
    });
  });

  describe('GET /v1/tfm/users/id/:userId', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await testApi.get('/v1/tfm/users/id/6040e8eff8ca8a0015355555');
      expect(status).toEqual(404);
    });

    it('returns the requested resource', async () => {
      const createdUserResponse = await testApi.post({ user: mockUsers[0], auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to('/v1/tfm/users');
      const createdUser = createdUserResponse.body;

      const { status, body } = await testApi.get(`/v1/tfm/users/id/${createdUser._id}`);

      expect(status).toEqual(200);
      expect(body).toMatchObject({
        ...createdUser,
        auditRecord: {
          lastUpdatedAt: expect.any(String),
          lastUpdatedByTfmUserId: MOCK_TFM_USER._id,
          lastUpdatedByPortalUserId: null,
          lastUpdatedByIsSystem: null,
          noUserLoggedIn: null,
        },
      });
    });
  });

  describe('DELETE /v1/tfm/users/:username', () => {
    let userToDeleteId;

    beforeEach(async () => {
      const response = await testApi.post({ user: mockUsers[0], auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to('/v1/tfm/users');
      userToDeleteId = new ObjectId(response.body._id);
    });

    withValidateAuditDetailsTests({
      makeRequest: (auditDetails) => testApi.remove({ auditDetails }).to(`/v1/tfm/users/${mockUsers[0].username}`),
    });

    withDeleteOneTests({
      makeRequest: () => testApi.remove({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to(`/v1/tfm/users/${mockUsers[0].username}`),
      collectionName: MONGO_DB_COLLECTIONS.TFM_USERS,
      auditRecord: generateMockTfmUserAuditDatabaseRecord(MOCK_TFM_USER._id),
      getDeletedDocumentId: () => userToDeleteId,
    });
  });

  describe('GET /v1/tfm/users/team/:teamId', () => {
    it('returns all users in given team', async () => {
      await Promise.all(
        mockUsers.map(async (mockUser) => testApi.post({ user: mockUser, auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to('/v1/tfm/users')),
      );

      const team1Users = mockUsers.filter((u) => u.teams.includes('TEAM1'));

      const { status, body } = await testApi.get(`/v1/tfm/users/team/${mockUsers[0].teams[0]}`);

      expect(status).toEqual(200);
      expect(body.length).toEqual(team1Users.length);

      const firstUserUsername = team1Users[0].username;
      const secondUserUsername = team1Users[1].username;

      expect(body.find((u) => u.username === firstUserUsername)).toBeDefined();
      expect(body.find((u) => u.username === secondUserUsername)).toBeDefined();
    });
  });
});
