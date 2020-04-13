const { ObjectId } = require('mongodb');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deals/deal-builder');

const app = require('../../../src/createApp');
const {
  get, post, put,
} = require('../../api')(app);


const getToken = require('../../getToken')(app);

describe('/v1/deals/:id/bond/create', () => {
  const newDeal = aDeal({
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
    },
  });

  let aUserWithoutRoles;
  let user1;
  let user2;
  let superuser;

  beforeEach(async () => {
    await wipeDB();

    aUserWithoutRoles = await getToken({
      username: '1',
      password: '2',
      roles: [],
    });

    user1 = await getToken({
      username: '3',
      password: '4',
      roles: ['maker'],
      bank: {
        id: '1',
        name: 'Mammon',
      },
    });

    user2 = await getToken({
      username: '5',
      password: '6',
      roles: ['maker'],
      bank: {
        id: '2',
        name: 'Temple of cash',
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
  });

  describe('PUT /v1/deals/:id/bond/create', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await put().to('/v1/deals/123456789012/bond/create');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await put(aUserWithoutRoles).to('/v1/deals/123456789012/bond/create');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await put(user2).to(`/v1/deals/${dealId}/bond/create`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown resources', async () => {
      const { status } = await put({}, user1).to('/v1/deals/123456789012/bond/create');

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await put({}, superuser).to(`/v1/deals/${dealId}/bond/create`);

      expect(status).toEqual(200);
    });

    it('adds an empty bond to a deal', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals/');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      await put({}, user1).to(`/v1/deals/${dealId}/bond/create`);

      const { status, body } = await get(
        `/v1/deals/${dealId}`,
        user1,
      );
      expect(status).toEqual(200);
      expect(body.bondTransactions.items.length).toEqual(1);
      expect(body.bondTransactions.items[0]._id).toBeDefined(); // eslint-disable-line no-underscore-dangle
    });

    it('adds an empty bond to a deal whilst retaining existing bonds', async () => {
      const mockBond = { _id: '123456789012' };
      const newDealWithExistingBonds = {
        ...newDeal,
        bondTransactions: {
          items: [
            mockBond,
          ],
        },
      };

      const postResult = await post(newDealWithExistingBonds, user1).to('/v1/deals/');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      await put({}, user1).to(`/v1/deals/${dealId}/bond/create`);

      const { status, body } = await get(
        `/v1/deals/${dealId}`,
        user1,
      );
      expect(status).toEqual(200);
      expect(body.bondTransactions.items.length).toEqual(2);

      const existingBond = body.bondTransactions.items.find((b) =>
        b._id === mockBond._id); // eslint-disable-line no-underscore-dangle
      expect(Object.keys(existingBond).length).toEqual(1);
    });
  });

  describe('PUT /v1/deals/:id/bond/:bondId', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await put().to('/v1/deals/123456789012/bond/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await put(aUserWithoutRoles).to('/v1/deals/123456789012/bond/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await put(user2).to(`/v1/deals/${dealId}/bond/123456789012`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown resources', async () => {
      const { status } = await put({}, user1).to('/v1/deals/123456789012/bond/123456789012');

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await put({}, superuser).to(`/v1/deals/${dealId}/bond/123456789012`);

      expect(status).toEqual(200);
    });

    // it('404s a request if bond cannot be found', async () => {
    //   const postResult = await post(newDeal, user1).to('/v1/deals/');
    //   const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

    //   await put({}, user1).to(`/v1/deals/${dealId}/bond/create`);

    //   const { status } = await put({}, user1).to(`/v1/deals/${dealId}/bond/012345789012`);

    //   expect(status).toEqual(404);
    // });

    it('updates an existing bond', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals/');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const bondBody = {
        bondIssuer: 'issuer',
        bondType: 'bond type',
        bondStage: 'unissued',
        ukefGuaranteeInMonths: '24',
        'requestedCoverStartDate-day': '01',
        'requestedCoverStartDate-month': '02',
        'requestedCoverStartDate-year': '2020',
        'coverEndDate-day': '01',
        'coverEndDate-month': '02',
        'coverEndDate-year': '2022',
        uniqueIdentificationNumber: '1234',
        bondBeneficiary: 'test',
      };

      const createBondResponse = await put({}, user1).to(`/v1/deals/${dealId}/bond/create`);

      const { body: createBondBody } = createBondResponse;
      const { bondId } = createBondBody;

      const { status } = await put(bondBody, user1).to(`/v1/deals/${dealId}/bond/${bondId}`);

      expect(status).toEqual(200);

      const { body: updatedDeal } = await get(
        `/v1/deals/${dealId}`,
        user1,
      );

      expect(status).toEqual(200);

      const updatedBond = updatedDeal.bondTransactions.items.find((b) =>
        b._id === bondId); // eslint-disable-line no-underscore-dangle

      expect(updatedBond).toEqual({
        _id: bondId, // eslint-disable-line no-underscore-dangle
        ...bondBody,
      });
    });
  });
});
