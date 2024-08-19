const { ObjectId } = require('mongodb');
const { MONGO_DB_COLLECTIONS, FACILITY_TYPE } = require('@ukef/dtfs2-common');
const { withDeleteManyTests, withDeleteOneTests, expectAnyPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const databaseHelper = require('../../../database-helper');

const app = require('../../../../src/createApp');
const testUserCache = require('../../../api-test-users');
const { withClientAuthenticationTests } = require('../../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../../common-tests/role-authorisation-tests');
const { MAKER } = require('../../../../src/v1/roles/roles');

const { as, remove } = require('../../../api')(app);

const baseUrl = '/v1/gef/facilities';

const applicationBaseUrl = '/v1/gef/application';
const mockApplications = require('../../../fixtures/gef/application');

const { DB_COLLECTIONS } = require('../../../fixtures/constants');

describe(baseUrl, () => {
  let aMaker;
  let mockApplication;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole(MAKER).one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES, DB_COLLECTIONS.DEALS]);

    mockApplication = await as(aMaker).post(mockApplications[0]).to(applicationBaseUrl);
  });

  describe(`DELETE ${baseUrl}/:id`, () => {
    let facilityToDeleteId;
    beforeEach(async () => {
      const { body } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
      facilityToDeleteId = new ObjectId(body.details._id);
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => remove(`${baseUrl}/${facilityToDeleteId}`),
      makeRequestWithAuthHeader: (authHeader) => remove(`${baseUrl}/${facilityToDeleteId}`, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
      makeRequestAsUser: (user) => as(user).remove(`${baseUrl}/${facilityToDeleteId}`),
      successStatusCode: 200,
    });

    withDeleteOneTests({
      makeRequest: () => as(aMaker).remove(`${baseUrl}/${String(facilityToDeleteId)}`),
      collectionName: MONGO_DB_COLLECTIONS.FACILITIES,
      auditRecord: expectAnyPortalUserAuditDatabaseRecord(),
      getDeletedDocumentId: () => facilityToDeleteId,
    });
  });

  describe(`DELETE ${baseUrl}?dealId=`, () => {
    let facilitiesToDeleteIds;

    beforeEach(async () => {
      const { body: cashBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
      const { body: contingentBody } = await as(aMaker)
        .post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CONTINGENT, hasBeenIssued: false })
        .to(baseUrl);
      facilitiesToDeleteIds = [new ObjectId(cashBody.details._id), new ObjectId(contingentBody.details._id)];
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => remove(`${baseUrl}?dealId=${mockApplication.body._id}`),
      makeRequestWithAuthHeader: (authHeader) => remove(`${baseUrl}?dealId=${mockApplication.body._id}`, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
      makeRequestAsUser: (user) => as(user).remove(`${baseUrl}?dealId=${mockApplication.body._id}`),
      successStatusCode: 200,
    });

    withDeleteManyTests({
      makeRequest: () => as(aMaker).remove(`${baseUrl}?dealId=${mockApplication.body._id}`),
      collectionName: MONGO_DB_COLLECTIONS.FACILITIES,
      auditRecord: expectAnyPortalUserAuditDatabaseRecord(),
      getDeletedDocumentIds: () => facilitiesToDeleteIds,
      expectedSuccessResponseBody: { acknowledged: true, deletedCount: 2 },
    });

    // This behaviour matches existing implimentation
    // As this endpoint is called when deleting by deal id, there is a chance that there are
    // no facilities to delete, but we can just handle this as a success
    it('returns 200 if there are no facilities to delete', async () => {
      const { status: firstStatus } = await as(aMaker).remove(`${baseUrl}?dealId=${mockApplication.body._id}`);
      const { status: secondStatus } = await as(aMaker).remove(`${baseUrl}?dealId=${mockApplication.body._id}`);
      expect(firstStatus).toBe(200);
      expect(secondStatus).toBe(200);
    });
  });
});
