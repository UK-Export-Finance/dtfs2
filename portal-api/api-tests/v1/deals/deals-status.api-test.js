const { generateParsedMockPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const databaseHelper = require('../../database-helper');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed');
const sendStatusUpdateEmails = require('../../../src/v1/controllers/deal-status/send-status-update-emails');
const createFacilities = require('../../createFacilities');
const api = require('../../../src/v1/api');
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../../../src/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const { STATUS } = require('../../../src/constants/user');

const { as, get, put } = require('../../api')(app);

jest.mock('../../../src/v1/controllers/deal-status/send-status-update-emails');

describe('/v1/deals/:id/status', () => {
  const dealStatusUrl = (dealId) => `/v1/deals/${dealId}/status`;
  const dealStatusUrlForUnknownDealId = dealStatusUrl('620a1aa095a618b12da38c7b');

  let aBarclaysMaker;
  let anHSBCMaker;
  let aBarclaysChecker;
  let aBarclaysMakerChecker;
  let aSuperuser;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    const barclaysMakers = testUsers().withRole(MAKER).withBankName('Barclays Bank').all();
    [aBarclaysMaker] = barclaysMakers;
    anHSBCMaker = testUsers().withRole(MAKER).withBankName('HSBC').one();
    aBarclaysChecker = testUsers().withRole(CHECKER).withBankName('Barclays Bank').one();

    const barclaysMakerChecker = testUsers().withMultipleRoles(MAKER, CHECKER).withBankName('Barclays Bank').one();
    aBarclaysMakerChecker = barclaysMakerChecker;
    aSuperuser = testUsers().superuser().one();
  });

  describe('GET /v1/deals/:id/status', () => {
    let dealId;
    let urlToGetDealStatus;

    beforeAll(async () => {
      const {
        body: { _id: createdDealId },
      } = await as(aBarclaysMaker).post(completedDeal).to('/v1/deals');
      dealId = createdDealId;
      urlToGetDealStatus = dealStatusUrl(dealId);
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(urlToGetDealStatus),
      makeRequestWithAuthHeader: (authHeader) => get(urlToGetDealStatus, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).withBankName('Barclays Bank').one(),
      makeRequestAsUser: (user) => as(user).get(urlToGetDealStatus),
      successStatusCode: 200,
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await as(aBarclaysMaker).get(dealStatusUrlForUnknownDealId);

      expect(status).toEqual(404);
    });

    it('401s requests if <user>.bank != <resource>/bank', async () => {
      const { body } = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');

      const { status } = await as(aBarclaysMaker).get(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(401);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const { status } = await as(aSuperuser).get(urlToGetDealStatus);

      expect(status).toEqual(200);
    });

    it('returns the requested resource', async () => {
      const { status, text } = await as(aBarclaysMaker).get(urlToGetDealStatus);

      expect(status).toEqual(200);
      expect(text).toEqual("Ready for Checker's approval");
    });
  });

  describe('PUT /v1/deals/:id/status', () => {
    let dealId;
    let urlForDealStatus;
    let urlForDeal;

    beforeEach(async () => {
      await databaseHelper.wipe([DB_COLLECTIONS.DEALS]);
      await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES]);

      api.tfmDealSubmit = () => Promise.resolve();

      const {
        body: { _id: createdDealId },
      } = await as(aBarclaysMaker).post(completedDeal).to('/v1/deals');
      dealId = createdDealId;
      urlForDealStatus = dealStatusUrl(dealId);
      urlForDeal = `/v1/deals/${dealId}`;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => put(urlForDealStatus, completedDeal),
      makeRequestWithAuthHeader: (authHeader) => put(urlForDealStatus, completedDeal, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER],
      getUserWithRole: (role) => testUsers().withRole(role).withBankName('Barclays Bank').one(),
      makeRequestAsUser: (user) => as(user).put(completedDeal).to(urlForDealStatus),
      successStatusCode: 200,
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(testUsers).put(completedDeal).to(dealStatusUrlForUnknownDealId);

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/bank', async () => {
      const { body } = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');

      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned',
      };

      const { status } = await as(aBarclaysMaker).put(statusUpdate).to(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(401);
    });

    it('returns the updated status', async () => {
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned',
      };

      const { status, body } = await as(aBarclaysMaker).put(statusUpdate).to(urlForDealStatus);

      expect(status).toEqual(200);
      expect(body.status).toEqual('Abandoned');
    });

    it('updates the deal', async () => {
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned',
      };

      await as(aBarclaysMaker).put(statusUpdate).to(urlForDealStatus);

      const { status, body } = await as(aBarclaysMaker).get(urlForDeal);

      expect(status).toEqual(200);
      expect(body.deal.status).toEqual('Abandoned');
    });

    it('updates the deals updatedAt field', async () => {
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned',
      };

      await as(aBarclaysMaker).put(statusUpdate).to(urlForDealStatus);

      const { status, body } = await as(aBarclaysMaker).get(urlForDeal);

      expect(status).toEqual(200);
      expect(body.deal.updatedAt).not.toEqual(completedDeal.updatedAt);
    });

    it('updates the deals.previousStatus field', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const { body: createdDealBody } = await as(anHSBCMaker).get(`/v1/deals/${postResult.body._id}`);
      const createdDeal = createdDealBody.deal;

      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned',
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.deal.previousStatus).toEqual(createdDeal.status);
      expect(body.deal.status).toEqual('Abandoned');
    });

    it('does NOT update previousStatus if the `from` and `to` status matches', async () => {
      await createFacilities(aBarclaysMaker, dealId, completedDeal.mockFacilities);

      const statusUpdate = {
        comments: 'Flee!',
        status: completedDeal.status,
      };

      const expectedPreviousStatus = completedDeal.previousStatus;

      await as(aBarclaysMaker).put(statusUpdate).to(urlForDealStatus);

      const { body } = await as(aBarclaysMaker).get(urlForDeal);

      expect(body.deal.previousStatus).toEqual(expectedPreviousStatus);
      expect(body.deal.status).toEqual(completedDeal.status);
    });

    it('adds the comment to the existing comments', async () => {
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned',
      };

      await as(aBarclaysMaker).put(statusUpdate).to(urlForDealStatus);

      const { body } = await as(aBarclaysMaker).get(urlForDeal);
      expect(body.deal.comments[0]).toEqual({
        text: 'Flee!',
        timestamp: expect.any(Number),
        user: {
          _id: expect.any(String),
          bank: aBarclaysMaker.bank,
          roles: aBarclaysMaker.roles,
          lastLogin: expect.any(String),
          username: aBarclaysMaker.username,
          email: aBarclaysMaker.email,
          firstname: aBarclaysMaker.firstname,
          surname: aBarclaysMaker.surname,
          timezone: 'Europe/London',
          'user-status': STATUS.ACTIVE,
          isTrusted: aBarclaysMaker.isTrusted,
        },
      });
    });

    it('updates the audit record', async () => {
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned',
      };

      await as(aBarclaysMaker).put(statusUpdate).to(urlForDealStatus);

      const { body } = await as(aBarclaysMaker).get(urlForDeal);
      expect(body.deal.auditRecord).toEqual(generateParsedMockPortalUserAuditDatabaseRecord(aBarclaysMaker._id));
    });

    it('adds the user to `editedBy` array', async () => {
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned',
      };

      await as(aBarclaysMaker).put(statusUpdate).to(urlForDealStatus);

      const { body } = await as(aBarclaysMaker).get(urlForDeal);
      expect(body.deal.editedBy[body.deal.editedBy.length - 1]).toEqual({
        date: expect.any(Number),
        username: aBarclaysMaker.username,
        roles: aBarclaysMaker.roles,
        bank: aBarclaysMaker.bank,
        userId: aBarclaysMaker._id,
      });
    });

    it('sends an email if the status has changed', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDealId = postResult.body._id;

      await createFacilities(anHSBCMaker, createdDealId, completedDeal.mockFacilities);

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDealId}/status`);

      expect(sendStatusUpdateEmails).toHaveBeenCalled();
    });

    it('does NOT add the user to `editedBy` array if a checker changes status to "Further Maker\'s input required"', async () => {
      const statusUpdate = {
        comments: 'Flee!',
        status: "Further Maker's input required",
      };

      await as(aBarclaysChecker).put(statusUpdate).to(urlForDealStatus);

      const { body } = await as(aBarclaysMaker).get(urlForDeal);
      expect(body.deal.editedBy.length).toEqual(0);
    });

    it('does NOT add the user to `editedBy` array if a checker changes status to "Submitted"', async () => {
      const statusUpdate = {
        comments: 'Yay!',
        status: 'Submitted',
      };

      await as(aBarclaysChecker).put(statusUpdate).to(urlForDealStatus);

      const { body } = await as(aBarclaysMaker).get(urlForDeal);
      expect(body.deal.editedBy.length).toEqual(0);
    });

    it('rejects "Abandoned" updates if no comment provided.', async () => {
      const statusUpdate = {
        status: 'Abandoned',
      };

      const { body } = await as(aBarclaysMaker).put(statusUpdate).to(urlForDealStatus);

      expect(body).toEqual({
        success: false,
        count: 1,
        errorList: {
          comments: {
            order: '1',
            text: 'Comment is required when abandoning a deal.',
          },
        },
      });
    });

    it("rejects 'Ready for Checker's approval' updates if no comment provided.", async () => {
      const draftDeal = {
        ...completedDeal,
        status: 'Draft',
      };

      const postResult = await as(anHSBCMaker).post(draftDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: "Ready for Checker's approval",
      };

      const { body } = await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(body).toEqual({
        success: false,
        count: 1,
        errorList: {
          comments: {
            order: '1',
            text: 'Comment is required when submitting a deal for review.',
          },
        },
      });
    });

    it('rejects "Further makers Input Required" updates if no comment provided.', async () => {
      const statusUpdate = {
        status: "Further Maker's input required",
      };

      const { body } = await as(aBarclaysChecker).put(statusUpdate).to(urlForDealStatus);

      expect(body).toEqual({
        success: false,
        count: 1,
        errorList: {
          comments: {
            order: '1',
            text: 'Comment is required when returning a deal to maker.',
          },
        },
      });
    });

    it('rejects "Submitted" updates if t+cs not confirmed.', async () => {
      const statusUpdate = {
        status: 'Submitted',
      };

      const { body } = await as(aBarclaysChecker).put(statusUpdate).to(urlForDealStatus);

      expect(body).toEqual({
        success: false,
        count: 1,
        errorList: {
          confirmSubmit: {
            order: '1',
            text: 'Acceptance is required.',
          },
        },
      });
    });

    it('rejects "Submitted" updates if user is a maker AND checker that has created the deal.', async () => {
      const dealCreatedByMakerChecker = {
        ...completedDeal,
        details: {
          ...completedDeal.details,
          maker: aBarclaysMakerChecker,
        },
      };

      const postResult = await as(aBarclaysMakerChecker).post(dealCreatedByMakerChecker).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Submitted',
      };

      const { status } = await as(aBarclaysMakerChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(status).toEqual(401);
    });

    it('rejects "Submitted" updates if user is a maker AND checker that has edited the deal.', async () => {
      const dealEditedByMakerChecker = {
        ...completedDeal,
        editedBy: [
          {
            ...aBarclaysMakerChecker,
            userId: aBarclaysMakerChecker._id,
          },
        ],
      };

      const postResult = await as(aBarclaysMaker).post(dealEditedByMakerChecker).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Submitted',
      };

      const { status } = await as(aBarclaysMakerChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(status).toEqual(401);
    });
  });
});
