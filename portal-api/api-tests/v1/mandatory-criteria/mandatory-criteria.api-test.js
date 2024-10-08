const { ObjectId } = require('mongodb');
const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const {
  generateParsedMockPortalUserAuditDatabaseRecord,
  withDeleteOneTests,
  expectAnyPortalUserAuditDatabaseRecord,
} = require('@ukef/dtfs2-common/change-stream/test-helpers');
const databaseHelper = require('../../database-helper');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as, get, post, put, remove } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

const allMandatoryCriteria = require('../../fixtures/mandatoryCriteria');
const { ADMIN } = require('../../../src/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

const newMandatoryCriteria = allMandatoryCriteria[0];
const oldMandatoryCriteria = allMandatoryCriteria[1];
const updatedMandatoryCriteria = {
  ...newMandatoryCriteria,
  criteria: [
    ...newMandatoryCriteria.criteria,
    {
      title: 'Updated mandatory criteria',
    },
  ],
};

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

    it('returns a list of mandatory-criteria sorted by id', async () => {
      await as(anAdmin).post(allMandatoryCriteria[0]).to(allMandatoryCriteriaUrl);
      await as(anAdmin).post(allMandatoryCriteria[1]).to(allMandatoryCriteriaUrl);

      const { body } = await as(testUser).get(allMandatoryCriteriaUrl);

      expect(body).toEqual({
        count: allMandatoryCriteria.length,
        mandatoryCriteria: expectMongoIds(
          allMandatoryCriteria.map((criteria) => ({
            ...criteria,
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

    it('returns the latest mandatory criteria', async () => {
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

    it('returns a mandatory-criteria', async () => {
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
      successStatusCode: 200,
    });
  });

  describe('PUT /v1/mandatory-criteria/:version', () => {
    const mandatoryCriteria1Url = '/v1/mandatory-criteria/1';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => put(mandatoryCriteria1Url, updatedMandatoryCriteria),
      makeRequestWithAuthHeader: (authHeader) => put(mandatoryCriteria1Url, updatedMandatoryCriteria, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).put(updatedMandatoryCriteria).to(mandatoryCriteria1Url),
      successStatusCode: 200,
    });

    it('updates a mandatory criteria', async () => {
      const mandatoryCriteria = allMandatoryCriteria[0];
      const update = {
        criteria: [{ title: 'new title' }],
      };

      await as(anAdmin).post(mandatoryCriteria).to('/v1/mandatory-criteria');
      await as(anAdmin).put(update).to(`/v1/mandatory-criteria/${mandatoryCriteria.version}`);

      const { status, body } = await as(anAdmin).get(`/v1/mandatory-criteria/${mandatoryCriteria.version}`);

      expect(status).toEqual(200);
      expect(body).toEqual(
        expectMongoId({
          ...mandatoryCriteria,
          criteria: update.criteria,
          auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(anAdmin._id),
        }),
      );
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
      makeRequestAsUser: (user) => as(user).remove(newMandatoryCriteriaUrl),
      successStatusCode: 200,
    });

    withDeleteOneTests({
      makeRequest: () => as(anAdmin).remove(newMandatoryCriteriaUrl),
      collectionName: MONGO_DB_COLLECTIONS.MANDATORY_CRITERIA,
      auditRecord: expectAnyPortalUserAuditDatabaseRecord(),
      getDeletedDocumentId: () => mandatoryCriteriaToDeleteId,
    });
  });
});
