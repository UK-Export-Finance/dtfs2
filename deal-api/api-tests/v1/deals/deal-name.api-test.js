const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../../src/createApp');
const {
  get, post, put, remove,
} = require('../../api')(app);

const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');

const getToken = require('../../getToken')(app);

describe('/v1/deals/:id/bankSupplyContractName', () => {
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

  describe('PUT /v1/deals/:id/bankSupplyContractName', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await put({bankSupplyContractName:'a new name'}).to('/v1/deals/123456789012/bankSupplyContractName');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await put({bankSupplyContractName:'a new name'}, aUserWithoutRoles).to(
        '/v1/deals/123456789012/bankSupplyContractName',
      );

      expect(status).toEqual(401);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await put({bankSupplyContractName:'a new name'}, maker1).to(
        '/v1/deals/123456789012/bankSupplyContractName',
      );

      expect(status).toEqual(404);
    });

    it('401s requests if <user> != <resource>/details.maker', async () => {
      const {body} = await post(newDeal, maker1).to('/v1/deals');

      const {status} = await put({bankSupplyContractName:'a new name'}, maker2).to(`/v1/deals/${body._id}/bankSupplyContractName`);

      expect(status).toEqual(401);
    });

    it('returns the updated bankSupplyContractName', async () => {
      const postResult = await post(newDeal, maker1).to('/v1/deals');
      const createdDeal = postResult.body;

      const { status, text } = await put({bankSupplyContractName:'a new name'}, maker1).to(`/v1/deals/${createdDeal._id}/bankSupplyContractName`);

      expect(status).toEqual(200);
      expect(text).toEqual('a new name');
    });

    it('updates the deal', async () => {
      const postResult = await post(newDeal, maker1).to('/v1/deals');
      const createdDeal = postResult.body;

      await put({bankSupplyContractName:'a new name'}, maker1).to(`/v1/deals/${createdDeal._id}/bankSupplyContractName`);

      const { status, body } = await get(
        `/v1/deals/${createdDeal._id}`,
        maker1,
      );

      expect(status).toEqual(200);
      expect(body.details.bankSupplyContractName).toEqual('a new name');
    });

    it('updates the deals details.dateOfLastAction field', async () => {
      const postResult = await post(newDeal, maker1).to('/v1/deals');
      const createdDeal = postResult.body;

      await put({bankSupplyContractName:'a new name'}, maker1).to(`/v1/deals/${createdDeal._id}/bankSupplyContractName`);

      const { status, body } = await get(
        `/v1/deals/${createdDeal._id}`,
        maker1,
      );

      expect(status).toEqual(200);
      expect(body.details.dateOfLastAction).not.toEqual(newDeal.details.dateOfLastAction);
    });

  });

});
