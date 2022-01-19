const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed');
const sendStatusUpdateEmails = require('../../../src/v1/controllers/deal-status/send-status-update-emails');
const createFacilities = require('../../createFacilities');
const api = require('../../../src/v1/api');

const { as } = require('../../api')(app);

// Mock currency & country API calls as no currency/country data is in db during pipeline test as previous test had removed them
jest.mock('../../../src/v1/controllers/integration/helpers/convert-country-code-to-id', () => () => 826);
jest.mock('../../../src/v1/controllers/integration/helpers/convert-currency-code-to-id', () => () => 12);
jest.mock('../../../src/v1/controllers/deal-status/send-status-update-emails');

// jest.unmock('@azure/storage-file-share');

describe('/v1/deals/:id/status', () => {
  let noRoles;
  let aBarclaysMaker;
  let anHSBCMaker;
  let aBarclaysChecker;
  let aBarclaysMakerChecker;
  let aSuperuser;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    const barclaysMakers = testUsers().withRole('maker').withBankName('Barclays Bank').all();
    [aBarclaysMaker] = barclaysMakers;
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aBarclaysChecker = testUsers().withRole('checker').withBankName('Barclays Bank').one();

    const barclaysMakerChecker = testUsers().withMultipleRoles('maker', 'checker').withBankName('Barclays Bank').one();
    aBarclaysMakerChecker = barclaysMakerChecker;
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
    sendStatusUpdateEmails.mockClear();

    api.tfmDealSubmit = () => Promise.resolve();
  });

  describe('GET /v1/deals/:id/status', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/deals/123456789012/status');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker || role=checker', async () => {
      const { status } = await as(noRoles).get('/v1/deals/123456789012/status');

      expect(status).toEqual(401);
    });

    it('accepts requests from a user with role=maker', async () => {
      const { body } = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');

      const { status } = await as(anHSBCMaker).get(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(200);
    });

    it('accepts requests from a user with role=checker', async () => {
      const { body } = await as(aBarclaysMaker).post(completedDeal).to('/v1/deals');

      const { status } = await as(aBarclaysChecker).get(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(200);
    });

    it('401s requests if <user>.bank != <resource>/bank', async () => {
      const { body } = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');

      const { status } = await as(aBarclaysMaker).get(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(401);
    });

    it('404s requests for unkonwn ids', async () => {
      const { status } = await as(aBarclaysMaker).get('/v1/deals/123456789012/status');

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const { body } = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');

      const { status } = await as(aSuperuser).get(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(200);
    });

    it('returns the requested resource', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, text } = await as(anHSBCMaker).get(`/v1/deals/${newId}/status`);

      expect(status).toEqual(200);
      expect(text).toEqual("Ready for Checker's approval");
    });
  });

  describe('PUT /v1/deals/:id/status', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(completedDeal).to('/v1/deals/123456789012/status');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).put(completedDeal).to('/v1/deals/123456789012/status');

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

    it('404s requests for unknown ids', async () => {
      const { status } = await as(anHSBCMaker).put(completedDeal).to('/v1/deals/123456789012/status');

      expect(status).toEqual(404);
    });

    it('returns the updated status', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned',
      };

      const { status, body } = await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(status).toEqual(200);
      expect(body.status).toEqual('Abandoned');
    });

    it('updates the deal', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned',
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.deal.status).toEqual('Abandoned');
    });

    it('updates the deals updatedAt field', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned',
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);

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
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const dealId = postResult.body._id;

      await createFacilities(anHSBCMaker, dealId, completedDeal.mockFacilities);

      const statusUpdate = {
        comments: 'Flee!',
        status: completedDeal.status,
      };

      const expectedPreviousStatus = completedDeal.previousStatus;

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

      const { body } = await as(anHSBCMaker).get(`/v1/deals/${dealId}`);

      expect(body.deal.previousStatus).toEqual(expectedPreviousStatus);
      expect(body.deal.status).toEqual(completedDeal.status);
    });

    it('adds the comment to the existing comments', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned',
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(body.deal.comments[0]).toEqual({
        text: 'Flee!',
        timestamp: expect.any(String),
        user: {
          _id: expect.any(String),
          bank: anHSBCMaker.bank,
          roles: anHSBCMaker.roles,
          lastLogin: expect.any(String),
          username: anHSBCMaker.username,
          email: anHSBCMaker.email,
          firstname: anHSBCMaker.firstname,
          surname: anHSBCMaker.surname,
          timezone: 'Europe/London',
          'user-status': 'active',
        },
      });
    });

    it('adds the user to `editedBy` array', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned',
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);
      expect(body.deal.editedBy[body.deal.editedBy.length - 1]).toEqual({
        date: expect.any(Number),
        username: anHSBCMaker.username,
        roles: anHSBCMaker.roles,
        bank: anHSBCMaker.bank,
        userId: anHSBCMaker._id,
      });
    });

    it('sends an email if the status has changed', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const dealId = postResult.body._id;

      await createFacilities(anHSBCMaker, dealId, completedDeal.mockFacilities);

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

      expect(sendStatusUpdateEmails).toHaveBeenCalled();
    });

    it('does NOT send an email if the status hasn\'t changed', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: completedDeal.status,
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(sendStatusUpdateEmails).not.toHaveBeenCalled();
    });

    it('does NOT add the user to `editedBy` array if a checker changes status to "Further Maker\'s input required"', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Further Maker\'s input required',
      };

      await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);
      expect(body.deal.editedBy.length).toEqual(0);
    });

    it('does NOT add the user to `editedBy` array if a checker changes status to "Submitted"', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Yay!',
        status: 'Submitted',
      };

      await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);
      expect(body.deal.editedBy.length).toEqual(0);
    });

    it('rejects "Abandoned" updates if no comment provided.', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Abandoned',
      };

      const { body } = await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

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
      const postResult = await as(aBarclaysMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: "Further Maker's input required",
      };

      const { body } = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

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
      const postResult = await as(aBarclaysMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Submitted',
      };

      const { body } = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

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
      const dealCreatedBymakerChecker = {
        ...completedDeal,
        details: {
          ...completedDeal.details,
          maker: aBarclaysMakerChecker,
        },
      };

      const postResult = await as(aBarclaysMakerChecker).post(dealCreatedBymakerChecker).to('/v1/deals');
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
