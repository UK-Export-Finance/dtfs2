const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { get, post, put, remove } = require('../../api')(app);
const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');

describe('/v1/deals/:id/submission-details', () => {
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
  let anHSBCMaker;
  let aBarclaysMaker;
  let aBarclaysChecker;
  let aSuperuser;

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);

    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    aBarclaysChecker = testUsers().withRole('checker').withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aSuperuser = testUsers().superuser().one();
  });

  describe('GET /v1/deals/:id/submission-details', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/deals/123456789012/submission-details');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker || role=checker', async () => {
      const { status } = await get('/v1/deals/123456789012/submission-details', noRoles.token);

      expect(status).toEqual(401);
    });

    it('accepts requests from a user with role=maker', async () => {
      const {body} = await post(newDeal, anHSBCMaker.token).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}/submission-details`, anHSBCMaker.token);

      expect(status).toEqual(200);
    });

    it('accepts requests from a user with role=checker', async () => {
      const {body} = await post(newDeal, aBarclaysMaker.token).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}/submission-details`, aBarclaysChecker.token);

      expect(status).toEqual(200);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {

      const {body} = await post(newDeal, anHSBCMaker.token).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}/submission-details`, aBarclaysMaker.token);

      expect(status).toEqual(401);
    });

    it('404s requests for unkonwn ids', async () => {
      const { status } = await get(`/v1/deals/123456789012/submission-details`, aBarclaysMaker.token);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const {body} = await post(newDeal, anHSBCMaker.token).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}/submission-details`, aSuperuser.token);

      expect(status).toEqual(200);
    });

    it('returns the requested resource', async () => {
      const postResult = await post(newDeal, anHSBCMaker.token).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await get(`/v1/deals/${newId}/submission-details`, anHSBCMaker.token);

      expect(status).toEqual(200);
      expect(body).toEqual({ status: 'Not Started'});
    });
  });


  describe('PUT /v1/deals/:id/submission-details', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await put(newDeal).to('/v1/deals/123456789012/submission-details');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await put(newDeal, noRoles.token).to(
        '/v1/deals/123456789012/submission-details',
      );

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const {body} = await post(newDeal, anHSBCMaker.token).to('/v1/deals');

      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      const {status} = await put(statusUpdate, aBarclaysMaker.token).to(`/v1/deals/${body._id}/submission-details`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await put(newDeal, anHSBCMaker.token).to(
        '/v1/deals/123456789012/submission-details',
      );

      expect(status).toEqual(404);
    });

    it('returns the updated submission-details', async () => {
      const postResult = await post(newDeal, anHSBCMaker.token).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {
        supplierCompaniesHouseRegistrationNumber: '12345678'
      };
      const expectedResponse = {
        ...submissionDetails,
        status: 'Incomplete',
      }

      const { status, body } = await put(submissionDetails, anHSBCMaker.token).to(`/v1/deals/${createdDeal._id}/submission-details`);

      expect(status).toEqual(200);
      expect(body).toEqual(expectedResponse);
    });

    it('updates the deal', async () => {
      const postResult = await post(newDeal, anHSBCMaker.token).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {
        supplierCompaniesHouseRegistrationNumber: '12345678'
      };
      const expectedResponse = {
        ...submissionDetails,
        status: 'Incomplete',
      }

      await put(submissionDetails, anHSBCMaker.token).to(`/v1/deals/${createdDeal._id}/submission-details`);

      const { status, body } = await get(
        `/v1/deals/${createdDeal._id}`,
        anHSBCMaker.token,
      );

      expect(status).toEqual(200);
      expect(body.submissionDetails).toEqual(expectedResponse);
    });

    it('updates the deals details.dateOfLastAction field', async () => {
      const postResult = await post(newDeal, anHSBCMaker.token).to('/v1/deals');
      const createdDeal = postResult.body;

      const submissionDetails = {
        supplierCompaniesHouseRegistrationNumber: '12345678'
      };

      await put(submissionDetails, anHSBCMaker.token).to(`/v1/deals/${createdDeal._id}/submission-details`);

      const { status, body } = await get(
        `/v1/deals/${createdDeal._id}`,
        anHSBCMaker.token,
      );

      expect(status).toEqual(200);

      expect(body.details.dateOfLastAction).not.toEqual(createdDeal.details.dateOfLastAction);
    });

  });

});
