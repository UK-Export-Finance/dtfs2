const { generateMockNoUserLoggedInAuditDatabaseRecord } = require('@ukef/dtfs2-common/src/test-helpers/generate-mock-audit-database-record');
const databaseHelper = require('../../database-helper');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { MAKER, CHECKER, ADMIN } = require('../../../src/v1/roles/roles');
const { as, get, remove } = require('../../api')(app);

describe('/v1/feedback', () => {
  let noRoles;
  let anAdmin;
  let aBarclaysMaker;
  let aBarclaysChecker;
  let testUsers;

  const feedbackFormBody = {
    role: 'computers',
    organisation: 'Test ltd',
    reasonForVisiting: 'Other',
    reasonForVisitingOther: 'My other reason',
    easyToUse: 'Very good',
    clearlyExplained: 'Good',
    satisfied: 'Very satisfied',
    howCanWeImprove: 'Devs are doing a great job already',
    emailAddress: 'test@testing.com',
    submittedBy: {
      username: 'Tester',
      email: 'test@test.test',
    }
  };

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);

    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole(MAKER).withBankName('Barclays Bank').one();
    aBarclaysChecker = testUsers().withRole(CHECKER).withBankName('Barclays Bank').one();
    anAdmin = testUsers().withRole(ADMIN).one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe(['feedback']);
  });

  const postFeedback = async () => {
    const response = await as(aBarclaysMaker).post(feedbackFormBody).to('/v1/feedback');
    return response;
  };

  describe('POST /v1/feedback', () => {
    it('returns 200 for requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(feedbackFormBody).to('/v1/feedback');
      expect(status).toEqual(200);
    });

    it('returns 200 for requests that do not come from a user with role=maker || role=checker', async () => {
      const { status } = await as(noRoles).post(feedbackFormBody).to('/v1/feedback');
      expect(status).toEqual(200);
    });

    it('accepts requests from a user with role=maker', async () => {
      const { status } = await as(aBarclaysMaker).post(feedbackFormBody).to('/v1/feedback');

      expect(status).toEqual(200);
    });

    it('accepts requests from a user with role=checker', async () => {
      const { status } = await as(aBarclaysChecker).post(feedbackFormBody).to('/v1/feedback');
      expect(status).toEqual(200);
    });

    it('does not create a feedback when there are validation errors', async () => {
      await as(aBarclaysMaker).post({}).to('/v1/feedback');
      const { status, body } = await as(anAdmin).get('/v1/feedback');
      expect(status).toEqual(200);
      expect(body).toEqual([]);
    });

    describe('when all required fields provided', () => {
      it('creates a new feedback, adding `created` field', async () => {
        const { status, body: createdFeedback } = await postFeedback();

        expect(status).toEqual(200);
        expect(createdFeedback._id).toBeDefined();

        const { body: feedback } = await as(anAdmin).get(`/v1/feedback/${createdFeedback._id}`);

        expect(feedback).toEqual({
          ...feedbackFormBody,
          _id: expect.any(String),
          created: expect.any(Number),
          submittedBy: {
            username: 'Tester',
            email: 'test@test.test',
          },
          auditRecord: generateMockNoUserLoggedInAuditDatabaseRecord(),
        });
      });
    });
  });

  describe('GET /v1/feedback', () => {
    const feedbackUrl = '/v1/feedback';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(feedbackUrl),
      makeRequestWithAuthHeader: (authHeader) => get(feedbackUrl, { headers: { Authorization: authHeader } })
    });

    withRoleAuthorisationTests({
      allowedRoles: [ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => noRoles,
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

      expect(body).toEqual([
        { ...feedback1 },
        { ...feedback2 },
        { ...feedback3 },
      ]);
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
      makeRequestWithAuthHeader: (authHeader) => get(aFeedbackUrl, { headers: { Authorization: authHeader } })
    });

    withRoleAuthorisationTests({
      allowedRoles: [ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => noRoles,
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
        ...feedbackFormBody,
        _id: expect.any(String),
        created: expect.any(Number),
        submittedBy: {
          username: 'Tester',
          email: 'test@test.test',
        },
        auditRecord: generateMockNoUserLoggedInAuditDatabaseRecord(),

      });
    });
  });

  describe('DELETE /v1/feedback/:id', () => {
    let aFeedbackUrl;
    beforeEach(async () => {
      const createdFeedback = await postFeedback();
      const { _id } = createdFeedback.body;
      aFeedbackUrl = `/v1/feedback/${_id}`;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => remove(aFeedbackUrl),
      makeRequestWithAuthHeader: (authHeader) => remove(aFeedbackUrl, { headers: { Authorization: authHeader } })
    });

    withRoleAuthorisationTests({
      allowedRoles: [ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => noRoles,
      makeRequestAsUser: (user) => as(user).remove(aFeedbackUrl),
      successStatusCode: 200,
    });

    it('404s requests for unknown resources', async () => {
      const { status } = await as(anAdmin).remove('/v1/feedback/620a1aa095a618b12da38c7b');
      expect(status).toEqual(404);
    });

    it('deletes feedback', async () => {
      const createdFeedback = await postFeedback();
      const { _id } = createdFeedback.body;

      const { status } = await as(anAdmin).remove(`/v1/feedback/${_id}`);
      expect(status).toEqual(200);

      const getResponse = await as(anAdmin).get(`/v1/feedback/${_id}`);
      expect(getResponse.status).toEqual(404);
    });
  });
});
