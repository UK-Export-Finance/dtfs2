const { ObjectId } = require('mongodb');
const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const {
  generateParsedMockPortalUserAuditDatabaseRecord,
  withDeleteOneTests,
  expectAnyPortalUserAuditDatabaseRecord,
} = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { HttpStatusCode } = require('axios');
const databaseHelper = require('../../database-helper');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../../../src/v1/roles/roles');

const { as, get } = require('../../api')(app);
const { expectMongoId } = require('../../expectMongoIds');

const allMandatoryCriteria = require('../../fixtures/gef/mandatoryCriteriaVersioned');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

const newMandatoryCriteria = allMandatoryCriteria[0];
const newHTMLMandatoryCriteria = allMandatoryCriteria[2];

const baseUrl = '/v1/gef/mandatory-criteria-versioned';

console.error = jest.fn();

describe(baseUrl, () => {
  let maker1;
  let anAdmin;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    maker1 = testUsers().withRole(MAKER).one();
    anAdmin = testUsers().withRole(ADMIN).one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.GEF_MANDATORY_CRITERIA_VERSIONED]);
  });

  describe('GET /v1/gef/mandatory-criteria-versioned', () => {
    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(baseUrl),
      makeRequestWithAuthHeader: (authHeader) => get(baseUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).get(baseUrl),
      successStatusCode: 200,
    });
  });

  describe('GET /v1/gef/mandatory-criteria-versioned/latest', () => {
    const latestMandatoryCriteriaVersionedUrl = `${baseUrl}/latest`;

    beforeEach(async () => {
      await as(anAdmin).post(allMandatoryCriteria[0]).to(baseUrl);
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(latestMandatoryCriteriaVersionedUrl),
      makeRequestWithAuthHeader: (authHeader) => get(latestMandatoryCriteriaVersionedUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).get(latestMandatoryCriteriaVersionedUrl),
      successStatusCode: 200,
    });

    it('should return the latest mandatory-criteria version', async () => {
      await as(anAdmin).post(allMandatoryCriteria[0]).to(baseUrl);
      await as(anAdmin).post(allMandatoryCriteria[1]).to(baseUrl);
      await as(anAdmin).post(allMandatoryCriteria[2]).to(baseUrl);

      const { body } = await as(maker1).get(latestMandatoryCriteriaVersionedUrl);

      expect(body).toEqual(
        expect.objectContaining({
          version: 4,
          createdAt: expect.any(Number),
          updatedAt: null,
          isInDraft: false,
          title: 'Confirm eligibility (mandatory criteria)',
          introText: expect.any(String),
          criteria: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              body: expect.any(String),
            }),
          ]),
        }),
      );
    });
  });

  describe('GET /v1/gef/mandatory-criteria-versioned/:id', () => {
    let oneMandatoryCriteriaVersionedUrl;

    beforeEach(async () => {
      const {
        body: { _id: newId },
      } = await as(anAdmin).post(newMandatoryCriteria).to(baseUrl);
      oneMandatoryCriteriaVersionedUrl = `${baseUrl}/${newId}`;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(oneMandatoryCriteriaVersionedUrl),
      makeRequestWithAuthHeader: (authHeader) => get(oneMandatoryCriteriaVersionedUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).get(oneMandatoryCriteriaVersionedUrl),
      successStatusCode: 200,
    });

    it('should returns a mandatory-criteria-versioned', async () => {
      const { status, body } = await as(anAdmin).get(oneMandatoryCriteriaVersionedUrl);
      expect(status).toEqual(200);
      const expected = {
        ...expectMongoId(newMandatoryCriteria),
        createdAt: expect.any(Number),
        criteria: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            body: expect.any(String),
          }),
        ]),
        auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(anAdmin._id),
      };
      expect(body).toEqual(expected);
    });
  });

  describe('POST /v1/gef/mandatory-criteria-versioned', () => {
    it('should reject requests that do not present a valid authorization token', async () => {
      // Act
      const { status } = await as().post(newMandatoryCriteria).to(baseUrl);

      // Assert
      expect(status).toEqual(HttpStatusCode.Unauthorized);
    });

    it('should reject requests that present a valid authorization token but do not have an "admin" role', async () => {
      // Act
      const { status } = await as(maker1).post(newMandatoryCriteria).to(baseUrl);

      // Assert
      expect(status).toEqual(HttpStatusCode.Unauthorized);
    });

    it('should reject a malformed payload send by an admin', async () => {
      // Act
      const { status } = await as(anAdmin).post({}).to(baseUrl);

      // Assert
      expect(status).toEqual(HttpStatusCode.BadRequest);
      expect(console.error).toHaveBeenCalledWith('Invalid GEF mandatory criteria payload supplied %o', {});
    });

    it('should accept requests that present a valid authorization token with an "admin" role', async () => {
      // Act
      const { status } = await as(anAdmin).post(newMandatoryCriteria).to(baseUrl);

      // Assert
      expect(status).toEqual(HttpStatusCode.Created);
    });

    it('should accept a HTML payload that present a valid authorization token with an "admin" role', async () => {
      // Act
      const { status } = await as(anAdmin).post(newHTMLMandatoryCriteria).to(baseUrl);

      // Assert
      expect(status).toEqual(HttpStatusCode.Created);
    });
  });

  describe('DELETE /v1/gef/mandatory-criteria-versioned/:id', () => {
    let criteriaToDeleteId;

    beforeEach(async () => {
      const { body } = await as(anAdmin).post(newMandatoryCriteria).to(baseUrl);
      criteriaToDeleteId = new ObjectId(body._id);
    });

    it('should reject requests that do not present a valid Authorization token', async () => {
      const item = await as(anAdmin).post(newMandatoryCriteria).to(baseUrl);
      const { status } = await as().remove(`${baseUrl}/${item.body._id}`);
      expect(status).toEqual(401);
    });

    it('should accept requests that present a valid authorization token with "admin" role', async () => {
      const item = await as(anAdmin).post(newMandatoryCriteria).to(baseUrl);
      const { status } = await as(anAdmin).remove(`${baseUrl}/${item.body._id}`);
      expect(status).toEqual(200);
    });

    withDeleteOneTests({
      makeRequest: () => as(anAdmin).remove(`${baseUrl}/${criteriaToDeleteId}`),
      collectionName: MONGO_DB_COLLECTIONS.GEF_MANDATORY_CRITERIA_VERSIONED,
      auditRecord: expectAnyPortalUserAuditDatabaseRecord(),
      getDeletedDocumentId: () => criteriaToDeleteId,
    });
  });
});
