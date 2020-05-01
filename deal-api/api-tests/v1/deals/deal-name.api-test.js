const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');

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

describe('/v1/deals/:id/bankSupplyContractName', () => {
  let noRoles;
  let aBarclaysMaker;
  let anotherBarclaysMaker;

  beforeAll(async() => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    const barclaysMakers = testUsers().withRole('maker').withBankName('Barclays Bank').all();
    aBarclaysMaker = barclaysMakers[0];
    anotherBarclaysMaker = barclaysMakers[1];
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
  });

  describe('PUT /v1/deals/:id/bankSupplyContractName', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put({bankSupplyContractName:'a new name'}).to('/v1/deals/123456789012/bankSupplyContractName');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).put({bankSupplyContractName:'a new name'}).to('/v1/deals/123456789012/bankSupplyContractName');

      expect(status).toEqual(401);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await as(aBarclaysMaker).put({bankSupplyContractName:'a new name'}).to('/v1/deals/123456789012/bankSupplyContractName');

      expect(status).toEqual(404);
    });

    it('401s requests if <user> != <resource>/details.maker', async () => {
      const {body} = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');

      const {status} = await as(anotherBarclaysMaker).put({bankSupplyContractName:'a new name'}).to(`/v1/deals/${body._id}/bankSupplyContractName`);

      expect(status).toEqual(401);
    });

    it('returns the updated bankSupplyContractName', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;

      const { status, text } = await as(aBarclaysMaker).put({bankSupplyContractName:'a new name'}).to(`/v1/deals/${createdDeal._id}/bankSupplyContractName`);

      expect(status).toEqual(200);
      expect(text).toEqual('a new name');
    });

    it('updates the deal', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;

      await as(aBarclaysMaker).put({bankSupplyContractName:'a new name'}).to(`/v1/deals/${createdDeal._id}/bankSupplyContractName`);

      const { status, body } = await as(aBarclaysMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.details.bankSupplyContractName).toEqual('a new name');
    });

    it('updates the deals details.dateOfLastAction field', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;

      await as(aBarclaysMaker).put({bankSupplyContractName:'a new name'}).to(`/v1/deals/${createdDeal._id}/bankSupplyContractName`);

      const { status, body } = await as(aBarclaysMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.details.dateOfLastAction).not.toEqual(newDeal.details.dateOfLastAction);
    });

  });

});
