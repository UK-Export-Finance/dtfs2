const actualDb = jest.requireActual('../../../src/drivers/db-client');
const mockGetCollection = jest.fn(actualDb.getCollection.bind(actualDb));

jest.mock('../../../src/drivers/db-client', () => ({
  ...jest.requireActual('../../../src/drivers/db-client'),
  getCollection: mockGetCollection,
}));

const { ObjectId } = require('mongodb');
const { withDeleteOneTests } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { generateMockTfmUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const app = require('../../../src/createApp');
const { as } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const MOCK_USERS = require('../../../src/v1/__mocks__/mock-users');

describe('user controller', () => {
  let userId = '';
  let tokenUser;
  const userForAuth = MOCK_USERS[0];
  const userToCreate = MOCK_USERS[1];

  beforeEach(async () => {
    tokenUser = await testUserCache.initialise();
  });

  afterAll(async () => {
    jest.resetAllMocks();

    // Remove test data.
    await as(tokenUser).remove().to(`/v1/users/${userToCreate._id}`);
    await as(tokenUser).remove().to(`/v1/users/${userForAuth._id}`);
  });

  describe('POST /v1/users', () => {
    it('should not create a new TFM user with malformed payload', async () => {
      const { body } = await as(tokenUser).post({}).to('/v1/users');
      expect(body).toEqual({});
    });

    it('creates a new TFM user', async () => {
      const user = MOCK_USERS[0];
      delete user._id;

      const { body } = await as(tokenUser).post(user).to('/v1/users');
      userId = body.user._id;
      expect(userId).toBeTruthy();
    });
  });

  describe('GET /v1/users', () => {
    it('returns the requested user if matched', async () => {
      const expectedResponse = { _id: userId, ...MOCK_USERS[0], status: 'active' };
      delete expectedResponse.password;

      const { status, body } = await as(tokenUser).get(`/v1/users/${userId}`);

      // deleted as token is added on api insertion/login
      delete expectedResponse.token;

      expect(status).toEqual(200);
      expect(body.user).toEqual(expectedResponse);
    });

    it('returns status 404 if userId not matched', async () => {
      const _id = '6051d94564494924d38ce67c';

      const { status, body } = await as(tokenUser).get(`/v1/users/${_id}`);
      expect(status).toEqual(404);
      expect(body.status).toEqual(404);
      expect(body.message).toEqual('User does not exist');
    });

    it('returns status 400 if userId is not valid', async () => {
      const invalidId = 'Z1234567890abcd';
      const { status } = await as(tokenUser).get(`/v1/users/${invalidId}`);
      expect(status).toEqual(400);
    });
  });

  describe('DELETE /v1/users', () => {
    let userToDeleteId;
    beforeEach(async () => {
      const response = await as(tokenUser).post(MOCK_USERS[0]).to('/v1/users');
      userToDeleteId = response.body.user._id;
    });
    if (process.env.CHANGE_STREAM_ENABLED === 'true') {
      withDeleteOneTests({
        makeRequest: () => as(tokenUser).remove().to(`/v1/users/${userToDeleteId}`),
        collectionName: 'tfm-users',
        auditRecord: {
          ...generateMockTfmUserAuditDatabaseRecord('abcdef123456abcdef123456'),
          lastUpdatedByTfmUserId: expect.anything(),
        },
        getDeletedDocumentId: () => new ObjectId(userToDeleteId),
        mockGetCollection,
      });
    }

    it('returns 200', async () => {
      const { status } = await as(tokenUser).remove().to(`/v1/users/${userToDeleteId}`);
      expect(status).toEqual(200);
    });

    it('returns status 400 if userId is not valid', async () => {
      const invalidId = 'Z1234567890abcd';
      const { status } = await as(tokenUser).remove().to(`/v1/users/${invalidId}`);
      expect(status).toEqual(400);
    });
  });
});
