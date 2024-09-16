const { ObjectId } = require('mongodb');
const { withDeleteOneTests } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { generateMockTfmUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const app = require('../../../src/createApp');
const { createApi } = require('../../api');
const { initialiseTestUsers } = require('../../api-test-users');
const MOCK_USERS = require('../../../src/v1/__mocks__/mock-users');

const { as } = createApi(app);

describe('user controller', () => {
  let userId = '';
  let tokenUser;

  beforeEach(async () => {
    tokenUser = await initialiseTestUsers(app);
  });

  afterAll(() => {
    jest.resetAllMocks();
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
      });
    }

    it('returns 200', async () => {
      const { status } = await as(tokenUser).remove().to(`/v1/users/${userToDeleteId}`);
      expect(status).toEqual(200);
    });
  });
});
