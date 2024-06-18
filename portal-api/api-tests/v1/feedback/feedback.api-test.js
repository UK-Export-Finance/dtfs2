const { ObjectId } = require('mongodb');
const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { generatePortalAuditDetails, generateNoUserLoggedInAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const {
  generateMockNoUserLoggedInAuditDatabaseRecord,
  generateParsedMockPortalUserAuditDatabaseRecord,
  withDeleteOneTests,
  expectAnyPortalUserAuditDatabaseRecord,
} = require('@ukef/dtfs2-common/change-stream/test-helpers');
const databaseHelper = require('../../database-helper');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { MAKER, CHECKER, ADMIN, READ_ONLY } = require('../../../src/v1/roles/roles');
const { as, get, remove } = require('../../api')(app);

describe('/v1/feedback', () => {
  let anAdmin;
  let aBarclaysMaker;
  let aBarclaysChecker;
  let testUsers;
  let testUser;

  const defaultFeedbackForm = {
    role: 'computers',
    organisation: 'Test ltd',
    reasonForVisiting: 'Other',
    reasonForVisitingOther: 'My other reason',
    easyToUse: 'Very good',
    clearlyExplained: 'Good',
    satisfied: 'Very satisfied',
    howCanWeImprove: 'Devs are doing a great job already',
    emailAddress: 'test@testing.com',
  };

  const getFeedbackToSubmit = (user) => ({
    ...defaultFeedbackForm,
    submittedBy: {
      username: user?.username ?? null,
      email: user?.email ?? null,
    },
    auditDetails: user ? generatePortalAuditDetails(user._id) : generateNoUserLoggedInAuditDetails(),
  });

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    testUser = testUsers().withRole(READ_ONLY).one();
    aBarclaysMaker = testUsers().withRole(MAKER).withBankName('Barclays Bank').one();
    aBarclaysChecker = testUsers().withRole(CHECKER).withBankName('Barclays Bank').one();
    anAdmin = testUsers().withRole(ADMIN).one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe(['feedback']);
  });

  const postFeedback = async () => {
    const response = await as(aBarclaysMaker).post(getFeedbackToSubmit(aBarclaysMaker)).to('/v1/feedback');
    return response;
  };

  describe('POST /v1/feedback', () => {
    it('returns 200 for requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(getFeedbackToSubmit()).to('/v1/feedback');
      expect(status).toEqual(200);
    });

    it('returns 200 for requests that do not come from a user with role=maker || role=checker', async () => {
      const { status } = await as(testUser).post(getFeedbackToSubmit(testUser)).to('/v1/feedback');
      expect(status).toEqual(200);
    });

    it('accepts requests from a user with role=maker', async () => {
      const { status } = await as(aBarclaysMaker).post(getFeedbackToSubmit(aBarclaysMaker)).to('/v1/feedback');

      expect(status).toEqual(200);
    });

    it('accepts requests from a user with role=checker', async () => {
      const { status } = await as(aBarclaysChecker).post(getFeedbackToSubmit(aBarclaysChecker)).to('/v1/feedback');
      expect(status).toEqual(200);
    });

    it('does not create a feedback when there are validation errors', async () => {
      await as(aBarclaysMaker).post({}).to('/v1/feedback');
      const { status, body } = await as(anAdmin).get('/v1/feedback');
      expect(status).toEqual(200);
      expect(body).toEqual([]);
    });

    describe('when all required fields provided', () => {
      describe('when a user is logged in', () => {
        it('creates a new feedback, adding `created` field and auditRecord', async () => {
          const { status, body: createdFeedback } = await as(aBarclaysMaker).post(getFeedbackToSubmit(aBarclaysMaker)).to('/v1/feedback');

          expect(status).toEqual(200);
          expect(createdFeedback._id).toBeDefined();

          const { body: feedback } = await as(anAdmin).get(`/v1/feedback/${createdFeedback._id}`);

          expect(feedback).toEqual({
            ...defaultFeedbackForm,
            _id: expect.any(String),
            created: expect.any(Number),
            submittedBy: {
              username: aBarclaysMaker.username,
              email: aBarclaysMaker.email,
            },
            auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(aBarclaysMaker._id),
          });
        });
      });

      describe('when no user is logged in', () => {
        it('creates a new feedback, adding `created` field and auditRecord', async () => {
          const { status, body: createdFeedback } = await as().post(getFeedbackToSubmit()).to('/v1/feedback');

          expect(status).toEqual(200);
          expect(createdFeedback._id).toBeDefined();

          const { body: feedback } = await as(anAdmin).get(`/v1/feedback/${createdFeedback._id}`);

          expect(feedback).toEqual({
            ...defaultFeedbackForm,
            _id: expect.any(String),
            created: expect.any(Number),
            submittedBy: {
              username: null,
              email: null,
            },
            auditRecord: generateMockNoUserLoggedInAuditDatabaseRecord(),
          });
        });
      });
    });
  });

  describe('GET /v1/feedback', () => {
    const feedbackUrl = '/v1/feedback';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(feedbackUrl),
      makeRequestWithAuthHeader: (authHeader) => get(feedbackUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).get(feedbackUrl),
      successStatusCode: 200,
    });

    it('returns all feedback', async () => {
      const { body: createdFeedback1 } = await postFeedback();
      const { body: createdFeedback2 } = await postFeedback();
      const { body: createdFeedback3 } = await postFeedback();

      const { body: feedback1 } = await as(anAdmin).get(`/v1/feedback/${createdFeedback1._id}`);
      const { body: feedback2 } = await as(anAdmin).get(`/v1/feedback/${createdFeedback2._id}`);
      const { body: feedback3 } = await as(anAdmin).get(`/v1/feedback/${createdFeedback3._id}`);

      const { status, body } = await as(anAdmin).get(feedbackUrl);

      expect(status).toEqual(200);

      expect(body).toEqual([{ ...feedback1 }, { ...feedback2 }, { ...feedback3 }]);
    });
  });

  describe('GET /v1/feedback/:id', () => {
    let aFeedbackUrl;

    beforeEach(async () => {
      const createdFeedback = await postFeedback();
      const { _id } = createdFeedback.body;
      aFeedbackUrl = `/v1/feedback/${_id}`;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(aFeedbackUrl),
      makeRequestWithAuthHeader: (authHeader) => get(aFeedbackUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).get(aFeedbackUrl),
      successStatusCode: 200,
    });

    it('404s requests for unknown resources', async () => {
      const { status } = await as(anAdmin).get('/v1/feedback/620a1aa095a618b12da38c7b');
      expect(status).toEqual(404);
    });

    it('returns a feedback', async () => {
      const { status, body } = await as(anAdmin).get(aFeedbackUrl);

      expect(status).toEqual(200);
      expect(body).toEqual({
        ...defaultFeedbackForm,
        _id: expect.any(String),
        created: expect.any(Number),
        submittedBy: {
          username: aBarclaysMaker.username,
          email: aBarclaysMaker.email,
        },
        auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(aBarclaysMaker._id),
      });
    });
  });

  describe('DELETE /v1/feedback/:id', () => {
    let aFeedbackUrl;
    let feedbackToDeleteId;

    beforeEach(async () => {
      const createdFeedback = await postFeedback();
      feedbackToDeleteId = new ObjectId(createdFeedback.body._id);
      aFeedbackUrl = `/v1/feedback/${feedbackToDeleteId}`;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => remove(aFeedbackUrl),
      makeRequestWithAuthHeader: (authHeader) => remove(aFeedbackUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).remove(aFeedbackUrl),
      successStatusCode: 200,
    });

    withDeleteOneTests({
      makeRequest: () => as(anAdmin).remove(aFeedbackUrl),
      collectionName: MONGO_DB_COLLECTIONS.FEEDBACK,
      auditRecord: expectAnyPortalUserAuditDatabaseRecord(),
      getDeletedDocumentId: () => feedbackToDeleteId,
    });

    it('404s requests for unknown resources', async () => {
      const { status } = await as(anAdmin).remove('/v1/feedback/620a1aa095a618b12da38c7b');
      expect(status).toEqual(404);
    });
  });
});
