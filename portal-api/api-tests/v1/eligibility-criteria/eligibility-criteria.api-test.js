const { generateParsedMockPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream');
const databaseHelper = require('../../database-helper');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const {
  withNoRoleAuthorisationTests,
  withRoleAuthorisationTests,
} = require('../../common-tests/role-authorisation-tests');

const { as, get, remove, put, post } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

const allEligibilityCriteria = require('../../fixtures/eligibilityCriteria');
const { ADMIN } = require('../../../src/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

const newEligibilityCriteria = allEligibilityCriteria[0];
const updatedEligibilityCriteria = {
  ...newEligibilityCriteria,
  criteria: [
    ...newEligibilityCriteria.criteria,
    {
      title: 'Updated eligibility criteria',
    },
  ],
};

describe('/v1/eligibility-criteria', () => {
  let noRoles;
  let anAdmin;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    anAdmin = testUsers().withRole(ADMIN).one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.ELIGIBILITY_CRITERIA]);
  });

  describe('GET /v1/eligibility-criteria', () => {
    const eligibilityCriteriaUrl = '/v1/eligibility-criteria';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(eligibilityCriteriaUrl),
      makeRequestWithAuthHeader: (authHeader) =>
        get(eligibilityCriteriaUrl, { headers: { Authorization: authHeader } }),
    });

    withNoRoleAuthorisationTests({
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => noRoles,
      makeRequestAsUser: (user) => as(user).get(eligibilityCriteriaUrl),
      successStatusCode: 200,
    });

    it('returns a list of eligibility-criteria sorted by id', async () => {
      // randomise the order a bit on the way in...
      await as(anAdmin).post(allEligibilityCriteria[0]).to(eligibilityCriteriaUrl);
      await as(anAdmin).post(allEligibilityCriteria[1]).to(eligibilityCriteriaUrl);

      const { body } = await as(noRoles).get(eligibilityCriteriaUrl);
      expect(body).toEqual({
        count: allEligibilityCriteria.length,
        eligibilityCriteria: expectMongoIds(
          allEligibilityCriteria.map((criteria) => ({
            ...criteria,
            auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(anAdmin._id),
          })),
        ),
      });
    });
  });

  describe('GET /v1/eligibility-criteria/latest', () => {
    const latestEligibilityCriteriaUrl = '/v1/eligibility-criteria/latest';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(latestEligibilityCriteriaUrl),
      makeRequestWithAuthHeader: (authHeader) =>
        get(latestEligibilityCriteriaUrl, { headers: { Authorization: authHeader } }),
    });

    withNoRoleAuthorisationTests({
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => noRoles,
      makeRequestAsUser: (user) => as(user).get(latestEligibilityCriteriaUrl),
      successStatusCode: 200,
    });

    it('returns the last created eligibility-criteria', async () => {
      await as(anAdmin).post(newEligibilityCriteria).to('/v1/eligibility-criteria');

      const { status, body } = await as(anAdmin).get(latestEligibilityCriteriaUrl);

      expect(status).toEqual(200);
      expect(body).toEqual(
        expectMongoId({
          ...newEligibilityCriteria,
          auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(anAdmin._id),
        }),
      );
    });
  });

  describe('GET /v1/eligibility-criteria/:version', () => {
    const eligibilityCriteria1Url = '/v1/eligibility-criteria/1';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(eligibilityCriteria1Url),
      makeRequestWithAuthHeader: (authHeader) =>
        get(eligibilityCriteria1Url, { headers: { Authorization: authHeader } }),
    });

    withNoRoleAuthorisationTests({
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => noRoles,
      makeRequestAsUser: (user) => as(user).get(eligibilityCriteria1Url),
      successStatusCode: 200,
    });

    it('returns an eligibility-criteria', async () => {
      await as(anAdmin).post(newEligibilityCriteria).to('/v1/eligibility-criteria');

      const { status, body } = await as(anAdmin).get(`/v1/eligibility-criteria/${newEligibilityCriteria.version}`);

      expect(status).toEqual(200);
      expect(body).toEqual(
        expectMongoId({
          ...newEligibilityCriteria,
          auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(anAdmin._id),
        }),
      );
    });
  });

  describe('POST /v1/eligibility-criteria', () => {
    const eligibilityCriteriaUrl = '/v1/eligibility-criteria';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => post(eligibilityCriteriaUrl, newEligibilityCriteria),
      makeRequestWithAuthHeader: (authHeader) =>
        post(eligibilityCriteriaUrl, newEligibilityCriteria, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => noRoles,
      makeRequestAsUser: (user) => as(user).post(newEligibilityCriteria).to(eligibilityCriteriaUrl),
      successStatusCode: 200,
    });
  });

  describe('PUT /v1/eligibility-criteria/:version', () => {
    const eligibilityCriteria1Url = '/v1/eligibility-criteria/1';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => put(eligibilityCriteria1Url, updatedEligibilityCriteria),
      makeRequestWithAuthHeader: (authHeader) =>
        put(eligibilityCriteria1Url, updatedEligibilityCriteria, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => noRoles,
      makeRequestAsUser: (user) => as(user).put(updatedEligibilityCriteria).to(eligibilityCriteria1Url),
      successStatusCode: 200,
    });

    it('updates an eligibility criteria', async () => {
      const eligibilityCriteria = allEligibilityCriteria[1];
      const update = {
        criteria: [{ title: 'new title' }],
      };

      await as(anAdmin).post(eligibilityCriteria).to('/v1/eligibility-criteria');
      await as(anAdmin).put(update).to(`/v1/eligibility-criteria/${eligibilityCriteria.version}`);

      const { status, body } = await as(anAdmin).get(`/v1/eligibility-criteria/${eligibilityCriteria.version}`);

      expect(status).toEqual(200);
      expect(body).toEqual(
        expectMongoId({
          ...eligibilityCriteria,
          criteria: update.criteria,
          auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(anAdmin._id),
        }),
      );
    });
  });

  describe('DELETE /v1/eligibility-criteria/:version', () => {
    const eligibilityCriteria1Url = '/v1/eligibility-criteria/1';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => remove(eligibilityCriteria1Url),
      makeRequestWithAuthHeader: (authHeader) =>
        remove(eligibilityCriteria1Url, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => noRoles,
      makeRequestAsUser: (user) => as(user).remove(eligibilityCriteria1Url),
      successStatusCode: 200,
    });

    it('deletes the eligibility-criteria', async () => {
      await as(anAdmin).post(newEligibilityCriteria).to('/v1/eligibility-criteria');
      await as(anAdmin).remove('/v1/eligibility-criteria/1');

      const { status, body } = await as(anAdmin).get('/v1/eligibility-criteria/1');

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
