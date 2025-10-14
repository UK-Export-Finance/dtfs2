const { ObjectId } = require('mongodb');
const { MONGO_DB_COLLECTIONS, format } = require('@ukef/dtfs2-common');
const {
  generateParsedMockPortalUserAuditDatabaseRecord,
  withDeleteOneTests,
  expectAnyPortalUserAuditDatabaseRecord,
} = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { HttpStatusCode } = require('axios');
const databaseHelper = require('../../database-helper');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { malformedPayloadTests, withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');

const app = require('../../../server/createApp');
const testUserCache = require('../../api-test-users');

const { as, get, post, remove } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

const allMandatoryCriteria = require('../../fixtures/mandatoryCriteria');
const { ADMIN } = require('../../../server/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

const newHTMLMandatoryCriteria = allMandatoryCriteria[1];
const newMandatoryCriteria = allMandatoryCriteria[1];
const oldMandatoryCriteria = allMandatoryCriteria[2];

console.error = jest.fn();

describe('/v1/mandatory-criteria', () => {
  let anAdmin;
  let testUsers;
  let testUser;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    testUser = testUsers().one();
    anAdmin = testUsers().withRole(ADMIN).one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.MANDATORY_CRITERIA]);
  });

  describe('GET /v1/mandatory-criteria', () => {
    const allMandatoryCriteriaUrl = '/v1/mandatory-criteria';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(allMandatoryCriteriaUrl),
      makeRequestWithAuthHeader: (authHeader) => get(allMandatoryCriteriaUrl, { headers: { Authorization: authHeader } }),
    });

    it('should return a list of mandatory-criteria sorted by id', async () => {
      await as(anAdmin).post(allMandatoryCriteria[0]).to(allMandatoryCriteriaUrl);
      await as(anAdmin).post(allMandatoryCriteria[1]).to(allMandatoryCriteriaUrl);
      await as(anAdmin).post(allMandatoryCriteria[2]).to(allMandatoryCriteriaUrl);

      const { body } = await as(testUser).get(allMandatoryCriteriaUrl);

      expect(body).toEqual({
        count: allMandatoryCriteria.length,
        mandatoryCriteria: expectMongoIds(
          allMandatoryCriteria.map((criteria) => ({
            ...format(criteria),
            auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(anAdmin._id),
          })),
        ),
      });
    });
  });

  describe('GET /v1/mandatory-criteria/latest', () => {
    const latestMandatoryCriteriaUrl = '/v1/mandatory-criteria/latest';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(latestMandatoryCriteriaUrl),
      makeRequestWithAuthHeader: (authHeader) => get(latestMandatoryCriteriaUrl, { headers: { Authorization: authHeader } }),
    });

    it('should return the latest mandatory criteria', async () => {
      await as(anAdmin).post(oldMandatoryCriteria).to('/v1/mandatory-criteria');
      await as(anAdmin).post(newMandatoryCriteria).to('/v1/mandatory-criteria');

      const { status, body } = await as(anAdmin).get(latestMandatoryCriteriaUrl);

      expect(status).toEqual(200);
      expect(body).toEqual(
        expectMongoId({
          ...newMandatoryCriteria,
          auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(anAdmin._id),
        }),
      );
    });
  });

  describe('GET /v1/mandatory-criteria/:version', () => {
    const mandatoryCriteria1Url = '/v1/mandatory-criteria/1';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(mandatoryCriteria1Url),
      makeRequestWithAuthHeader: (authHeader) => get(mandatoryCriteria1Url, { headers: { Authorization: authHeader } }),
    });

    it('should return a mandatory-criteria', async () => {
      await as(anAdmin).post(newMandatoryCriteria).to('/v1/mandatory-criteria');

      const { status, body } = await as(anAdmin).get(`/v1/mandatory-criteria/${newMandatoryCriteria.version}`);

      expect(status).toEqual(200);
      expect(body).toEqual(
        expectMongoId({
          ...newMandatoryCriteria,
          auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(anAdmin._id),
        }),
      );
    });
  });

  describe('POST /v1/mandatory-criteria', () => {
    const allMandatoryCriteriaUrl = '/v1/mandatory-criteria';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => post(allMandatoryCriteriaUrl, newMandatoryCriteria),
      makeRequestWithAuthHeader: (authHeader) => post(allMandatoryCriteriaUrl, newMandatoryCriteria, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).post(newMandatoryCriteria).to(allMandatoryCriteriaUrl),
      successStatusCode: HttpStatusCode.Created,
    });

    withRoleAuthorisationTests({
      allowedRoles: [ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).post(newHTMLMandatoryCriteria).to(allMandatoryCriteriaUrl),
      successStatusCode: HttpStatusCode.Created,
    });

    malformedPayloadTests({
      allowedRoles: [ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).post({}).to(allMandatoryCriteriaUrl),
      successStatusCode: HttpStatusCode.BadRequest,
    });
  });

  describe('DELETE /v1/mandatory-criteria/:version', () => {
    const newMandatoryCriteriaUrl = `/v1/mandatory-criteria/${newMandatoryCriteria.version}`;
    let mandatoryCriteriaToDeleteId;

    beforeEach(async () => {
      const { body } = await as(anAdmin).post(newMandatoryCriteria).to('/v1/mandatory-criteria');
      mandatoryCriteriaToDeleteId = new ObjectId(body.insertedId);
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => remove(newMandatoryCriteriaUrl),
      makeRequestWithAuthHeader: (authHeader) => remove(newMandatoryCriteriaUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
      makeRequestAsUser: (user) => as(user).remove().to(newMandatoryCriteriaUrl),
      successStatusCode: 200,
    });

    withDeleteOneTests({
      makeRequest: () => as(anAdmin).remove().to(newMandatoryCriteriaUrl),
      collectionName: MONGO_DB_COLLECTIONS.MANDATORY_CRITERIA,
      auditRecord: expectAnyPortalUserAuditDatabaseRecord(),
      getDeletedDocumentId: () => mandatoryCriteriaToDeleteId,
    });
  });
});
