const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { get, post, put, remove } = require('../../api')(app);
const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');

describe('/v1/deals/:id/status', () => {
  const newDeal = aDeal({
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
      status: "Draft",
      dateOfLastAction: '1985/11/04 21:00:00:000',
    },
    comments: [{
      username: 'bananaman',
      timestamp: '1984/12/25 00:00:00:001',
      text: 'Merry Christmas from the 80s',
    }, {
      username: 'supergran',
      timestamp: '1982/12/25 00:00:00:001',
      text: 'Also Merry Christmas from the 80s',
    }],
  });

  let noRoles;
  let aBarclaysMaker;
  let anotherBarclaysMaker;
  let anHSBCMaker;
  let aBarclaysChecker;
  let aSuperuser;

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);

    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    const barclaysMakers = testUsers().withRole('maker').withBankName('Barclays Bank').all();
    aBarclaysMaker = barclaysMakers[0];
    anotherBarclaysMaker = barclaysMakers[1];
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aBarclaysChecker = testUsers().withRole('checker').withBankName('Barclays Bank').one();
    aSuperuser = testUsers().superuser().one();
  });

  describe('GET /v1/deals/:id/status', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/deals/123456789012/status');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker || role=checker', async () => {
      const { status } = await get('/v1/deals/123456789012/status', noRoles.token);

      expect(status).toEqual(401);
    });

    it('accepts requests from a user with role=maker', async () => {
      const {body} = await post(newDeal, anHSBCMaker.token).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}/status`, anHSBCMaker.token);

      expect(status).toEqual(200);
    });

    it('accepts requests from a user with role=checker', async () => {
      const {body} = await post(newDeal, aBarclaysMaker.token).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}/status`, aBarclaysChecker.token);

      expect(status).toEqual(200);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {

      const {body} = await post(newDeal, anHSBCMaker.token).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}/status`, aBarclaysMaker.token);

      expect(status).toEqual(401);
    });

    it('404s requests for unkonwn ids', async () => {
      const { status } = await get(`/v1/deals/123456789012/status`, aBarclaysMaker.token);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const {body} = await post(newDeal, anHSBCMaker.token).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}/status`, aSuperuser.token);

      expect(status).toEqual(200);
    });

    it('returns the requested resource', async () => {
      const postResult = await post(newDeal, anHSBCMaker.token).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, text } = await get(`/v1/deals/${newId}/status`, anHSBCMaker.token);

      expect(status).toEqual(200);
      expect(text).toEqual('Draft');
    });
  });


  describe('PUT /v1/deals/:id/status', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await put(newDeal).to('/v1/deals/123456789012/status');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await put(newDeal, noRoles.token).to(
        '/v1/deals/123456789012/status',
      );

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const {body} = await post(newDeal, anHSBCMaker.token).to('/v1/deals');

      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      const {status} = await put(statusUpdate, aBarclaysMaker.token).to(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await put(newDeal, anHSBCMaker.token).to(
        '/v1/deals/123456789012/status',
      );

      expect(status).toEqual(404);
    });

    it('returns the updated status', async () => {
      const postResult = await post(newDeal, anHSBCMaker.token).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      const { status, text } = await put(statusUpdate, anHSBCMaker.token).to(`/v1/deals/${createdDeal._id}/status`);

      expect(status).toEqual(200);
      expect(text).toEqual('Abandoned Deal');
    });

    it('updates the deal', async () => {
      const postResult = await post(newDeal, anHSBCMaker.token).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      await put(statusUpdate, anHSBCMaker.token).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await get(
        `/v1/deals/${createdDeal._id}`,
        anHSBCMaker.token,
      );

      expect(status).toEqual(200);
      expect(body.details.status).toEqual('Abandoned Deal');
    });

    it('updates the deals details.dateOfLastAction field', async () => {
      const postResult = await post(newDeal, anHSBCMaker.token).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      await put(statusUpdate, anHSBCMaker.token).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await get(
        `/v1/deals/${createdDeal._id}`,
        anHSBCMaker.token,
      );

      expect(status).toEqual(200);
      expect(body.details.dateOfLastAction).not.toEqual(newDeal.details.dateOfLastAction);
    });

    it('updates details.previousStatus', async () => {
      const postResult = await post(newDeal, anHSBCMaker.token).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      await put(statusUpdate, anHSBCMaker.token).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await get(
        `/v1/deals/${createdDeal._id}`,
        anHSBCMaker.token,
      );

      expect(body.details.previousStatus).toEqual('Draft');
    });

    it('adds the comment to the existing comments', async () => {
      const postResult = await post(newDeal, anHSBCMaker.token).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      await put(statusUpdate, anHSBCMaker.token).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await get(
        `/v1/deals/${createdDeal._id}`,
        anHSBCMaker.token,
      );

      expect(body.comments[2]).toEqual({
        text: 'Flee!',
        username: anHSBCMaker.username,
        timestamp: expect.any(String),
      })
    });

    it('401s "Abandoned Deal" updates if not from the deals owner.', async () => {
      const postResult = await post(newDeal, aBarclaysMaker.token).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Abandoned Deal',
      };

      const { status, body } = await put(statusUpdate, anotherBarclaysMaker.token).to(`/v1/deals/${createdDeal._id}/status`);

      expect(status).toEqual(401);
    });

    it('rejects "Abandoned Deal" updates if no comment provided.', async () => {
      const postResult = await post(newDeal, anHSBCMaker.token).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Abandoned Deal',
      };

      const { status, body } = await put(statusUpdate, anHSBCMaker.token).to(`/v1/deals/${createdDeal._id}/status`);

      expect(body).toEqual({
        success: false,
        count: 1,
        errorList: {
          comments: {
            order: "1",
            text: "Comment is required when abandoning a deal."
          }
        }
      });
    });

    it("rejects 'Ready for Checker's approval' updates if no comment provided.", async () => {
      const postResult = await post(newDeal, anHSBCMaker.token).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: "Ready for Checker's approval",
      };

      const { status, body } = await put(statusUpdate, anHSBCMaker.token).to(`/v1/deals/${createdDeal._id}/status`);

      expect(body).toEqual({
        success: false,
        count: 1,
        errorList: {
          comments: {
            order: "1",
            text: "Comment is required when submitting a deal for review."
          }
        }
      });
    });

    it('rejects "Further makers Input Required" updates if no comment provided.', async () => {
      const postResult = await post(newDeal, aBarclaysMaker.token).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: "Further Maker's input required",
      };

      const { status, body } = await put(statusUpdate, aBarclaysChecker.token).to(`/v1/deals/${createdDeal._id}/status`);

      expect(body).toEqual({
        success: false,
        count: 1,
        errorList: {
          comments: {
            order: "1",
            text: "Comment is required when returning a deal to maker."
          }
        }
      });
    });

    it('rejects "Submitted" updates if t+cs not confirmed.', async () => {
      const postResult = await post(newDeal, aBarclaysMaker.token).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: "Submitted",
      };

      const { status, body } = await put(statusUpdate, aBarclaysChecker.token).to(`/v1/deals/${createdDeal._id}/status`);

      expect(body).toEqual({
        success: false,
        count: 1,
        errorList: {
          confirmSubmit: {
            order: "1",
            text: "Acceptance is required.",
          }
        }
      });
    });

  });

});
