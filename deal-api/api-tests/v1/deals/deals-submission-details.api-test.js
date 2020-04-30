const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../../src/createApp');
const {
  get, post, put, remove,
} = require('../../api')(app);

const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');

const getToken = require('../../getToken')(app);

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

  let aUserWithoutRoles;
  let maker1;
  let maker2;
  let maker3;
  let checker;

  beforeEach(async () => {
    await wipeDB.wipe(['deals', 'users']);

    aUserWithoutRoles = await getToken({
      username: '1',
      password: '2',
      roles: [],
    });

    maker1 = await getToken({
      username: 'maker1username',
      password: '4',
      roles: ['maker'],
      bank: {
        id: '1',
        name: 'Bank of Never Never Land',
      },
    });

    maker2 = await getToken({
      username: '5',
      password: '6',
      roles: ['maker'],
      bank: {
        id: '2',
        name: 'Pot o Gold',
      },
    });

    maker3 = await getToken({
      username: '15',
      password: '16',
      roles: ['maker'],
      bank: {
        id: '2',
        name: 'Pot o Gold',
      },
    });

    superuser = await getToken({
      username: '7',
      password: '8',
      roles: ['maker'],
      bank: {
        id: '*',
      },
    });

    checker = await getToken({
      username: '9',
      password: '10',
      roles: ['checker'],
      bank: {
        id: '2',
        name: 'Pot o Gold',
      },
    });

  });

  describe('GET /v1/deals/:id/submission-details', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/deals/123456789012/submission-details');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker || role=checker', async () => {
      const { status } = await get('/v1/deals/123456789012/submission-details', aUserWithoutRoles);

      expect(status).toEqual(401);
    });

    it('accepts requests from a user with role=maker', async () => {
      const {body} = await post(newDeal, maker1).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}/submission-details`, maker1);

      expect(status).toEqual(200);
    });

    it('accepts requests from a user with role=checker', async () => {
      const {body} = await post(newDeal, maker2).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}/submission-details`, checker);

      expect(status).toEqual(200);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {

      const {body} = await post(newDeal, maker1).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}/submission-details`, maker2);

      expect(status).toEqual(401);
    });

    it('404s requests for unkonwn ids', async () => {
      const { status } = await get(`/v1/deals/123456789012/submission-details`, maker2);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const {body} = await post(newDeal, maker1).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}/submission-details`, superuser);

      expect(status).toEqual(200);
    });

    it('returns the requested resource', async () => {
      const postResult = await post(newDeal, maker1).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await get(`/v1/deals/${newId}/submission-details`, maker1);

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
      const { status } = await put(newDeal, aUserWithoutRoles).to(
        '/v1/deals/123456789012/submission-details',
      );

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const {body} = await post(newDeal, maker1).to('/v1/deals');

      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      const {status} = await put(statusUpdate, maker2).to(`/v1/deals/${body._id}/submission-details`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await put(newDeal, maker1).to(
        '/v1/deals/123456789012/submission-details',
      );

      expect(status).toEqual(404);
    });

    it('returns the updated submission-details', async () => {
      const postResult = await post(newDeal, maker1).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {
        supplierCompaniesHouseRegistrationNumber: '12345678'
      };
      const expectedResponse = {
        ...submissionDetails,
        status: 'Incomplete',
      }

      const { status, body } = await put(submissionDetails, maker1).to(`/v1/deals/${createdDeal._id}/submission-details`);

      expect(status).toEqual(200);
      expect(body).toEqual(expectedResponse);
    });

    it('updates the deal', async () => {
      const postResult = await post(newDeal, maker1).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {
        supplierCompaniesHouseRegistrationNumber: '12345678'
      };
      const expectedResponse = {
        ...submissionDetails,
        status: 'Incomplete',
      }

      await put(submissionDetails, maker1).to(`/v1/deals/${createdDeal._id}/submission-details`);

      const { status, body } = await get(
        `/v1/deals/${createdDeal._id}`,
        maker1,
      );

      expect(status).toEqual(200);
      expect(body.submissionDetails).toEqual(expectedResponse);
    });

    it('updates the deals details.dateOfLastAction field', async () => {
      const postResult = await post(newDeal, maker1).to('/v1/deals');
      const createdDeal = postResult.body;

      const submissionDetails = {
        supplierCompaniesHouseRegistrationNumber: '12345678'
      };

      await put(submissionDetails, maker1).to(`/v1/deals/${createdDeal._id}/submission-details`);

      const { status, body } = await get(
        `/v1/deals/${createdDeal._id}`,
        maker1,
      );

      expect(status).toEqual(200);

      expect(body.details.dateOfLastAction).not.toEqual(createdDeal.details.dateOfLastAction);
    });

  });

});
