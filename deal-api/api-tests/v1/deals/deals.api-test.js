const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../../src/createApp');
const {
  get, post, put, remove,
} = require('../../api')(app);

const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');

const getToken = require('../../getToken')(app);

describe('/v1/deals', () => {
  const newDeal = aDeal({supplyContractName: 'Original Value'});

  let aUserWithoutRoles;
  let user1;
  let user2;

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
        name: 'Bank of Never Never Land',
      },
    });

    user2 = await getToken({
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

  });

  describe('GET /v1/deals', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/deals');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await get('/v1/deals', aUserWithoutRoles);

      expect(status).toEqual(401);
    });

    it('returns a list of deals ordered by "updated", filtered by <user>.bank.id', async () => {
      const deals = [
        aDeal({ supplyContractName: 'bank1/0' }),
        aDeal({ supplyContractName: 'bank1/1' }),
        aDeal({ supplyContractName: 'bank1/2' }),
        aDeal({ supplyContractName: 'bank2/0' }),
        aDeal({ supplyContractName: 'bank2/1' }),
      ];

      await post(deals[4], user2).to('/v1/deals');
      await post(deals[1], user1).to('/v1/deals');
      await post(deals[2], user1).to('/v1/deals');
      await post(deals[0], user1).to('/v1/deals');
      await post(deals[3], user2).to('/v1/deals');

      let { status, body } = await get('/v1/deals', user1);

      expect(status).toEqual(200);
      expect(body.deals).toEqual(expectAllAddedFields([
        deals[1],
        deals[2],
        deals[0]
      ]));

    });

    it('returns a list of deals ordered by "updated" if <user>.bank.id == *', async () => {
      const deals = [
        aDeal({ supplyContractName: 'bank1/0' }),
        aDeal({ supplyContractName: 'bank1/1' }),
        aDeal({ supplyContractName: 'bank1/2' }),
        aDeal({ supplyContractName: 'bank2/0' }),
        aDeal({ supplyContractName: 'bank2/1' }),
      ];

      await post(deals[4], user2).to('/v1/deals');
      await post(deals[1], user1).to('/v1/deals');
      await post(deals[2], user1).to('/v1/deals');
      await post(deals[0], user1).to('/v1/deals');
      await post(deals[3], user2).to('/v1/deals');

      let { status, body } = await get('/v1/deals', superuser);

      expect(status).toEqual(200);
      expect(body.deals).toEqual(expectAllAddedFields([
        deals[4],
        deals[1],
        deals[2],
        deals[0],
        deals[3],
      ]));

    });

  });

  describe('GET /v1/deals/:start/:pagesize', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/deals/0/1');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await get('/v1/deals/0/1', aUserWithoutRoles);

      expect(status).toEqual(401);
    });

    it('returns a list of deals, ordered by "updated", paginated by start/pagesize, filtered by <user>.bank.id', async () => {
      const deals = [
        aDeal({ supplyContractName: 'bank1/0' }),
        aDeal({ supplyContractName: 'bank1/1' }),
        aDeal({ supplyContractName: 'bank1/2' }),
        aDeal({ supplyContractName: 'bank1/3' }),
        aDeal({ supplyContractName: 'bank1/4' }),
        aDeal({ supplyContractName: 'bank1/5' }),
        aDeal({ supplyContractName: 'bank2/0' }),
        aDeal({ supplyContractName: 'bank2/1' }),
      ];

      await post(deals[0], user1).to('/v1/deals');
      await post(deals[1], user1).to('/v1/deals');
      await post(deals[2], user1).to('/v1/deals');
      await post(deals[3], user1).to('/v1/deals');
      await post(deals[4], user1).to('/v1/deals');
      await post(deals[5], user1).to('/v1/deals');

      await post(deals[6], user2).to('/v1/deals');
      await post(deals[7], user2).to('/v1/deals');

      const { status, body } = await get('/v1/deals/2/2', user1);

      expect(status).toEqual(200);
      expect(body.deals).toEqual(expectAllAddedFields([
        deals[2],
        deals[3],
      ]));

      expect(body.count).toEqual(6);
    });

    it('returns a list of deals, ordered by "updated", paginated by start/pagesize, if <user>.bank.id == *', async () => {
      const deals = [
        aDeal({ supplyContractName: 'bank1/0' }),
        aDeal({ supplyContractName: 'bank1/1' }),
        aDeal({ supplyContractName: 'bank1/2' }),
        aDeal({ supplyContractName: 'bank1/3' }),
        aDeal({ supplyContractName: 'bank1/4' }),
        aDeal({ supplyContractName: 'bank1/5' }),
        aDeal({ supplyContractName: 'bank2/0' }),
        aDeal({ supplyContractName: 'bank2/1' }),
      ];

      await post(deals[0], user1).to('/v1/deals');
      await post(deals[1], user1).to('/v1/deals');
      await post(deals[2], user1).to('/v1/deals');
      await post(deals[3], user1).to('/v1/deals');
      await post(deals[4], user1).to('/v1/deals');
      await post(deals[5], user1).to('/v1/deals');

      await post(deals[6], user2).to('/v1/deals');
      await post(deals[7], user2).to('/v1/deals');

      const { status, body } = await get('/v1/deals/5/3', superuser);

      expect(status).toEqual(200);
      expect(body.deals).toEqual(expectAllAddedFields([
        deals[5],
        deals[6],
        deals[7],
      ]));

      expect(body.count).toEqual(8);
    });
  });

  describe('GET /v1/deals/:id', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/deals/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await get('/v1/deals/123456789012', aUserWithoutRoles);

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const {body} = await post(newDeal, user1).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}`, user2);

      expect(status).toEqual(401);
    });

    it('404s requests for unkonwn ids', async () => {
      const { status } = await get(`/v1/deals/123456789012`, user2);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const {body} = await post(newDeal, user1).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}`, superuser);

      expect(status).toEqual(200);
    });

    it('returns the requested resource', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await get(`/v1/deals/${newId}`, user1);

      expect(status).toEqual(200);
      expect(body).toEqual(expectAddedFields(newDeal));
    });
  });

  describe('POST /v1/deals', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await post(newDeal).to('/v1/deals');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await post(newDeal, aUserWithoutRoles).to('/v1/deals');

      expect(status).toEqual(401);
    });

    it('returns the created deal', async () => {
      const { body, status } = await post(newDeal, user1).to(
        '/v1/deals',
      );

      expect(status).toEqual(200);
      expect(body).toEqual(expectAddedFields(newDeal));
    });
  });

  describe('PUT /v1/deals/:id', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await put(newDeal).to('/v1/deals/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await put(newDeal, aUserWithoutRoles).to(
        '/v1/deals/123456789012',
      );

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const {body} = await post(newDeal, user1).to('/v1/deals');

      const updatedDeal = {
        ...body,
        supplyContractName: 'change this field',
      }

      const {status} = await put(updatedDeal, user2).to(`/v1/deals/${body._id}`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await put(newDeal, user1).to(
        '/v1/deals/123456789012',
      );

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const createdDeal = postResult.body;
      const updatedDeal = {
        ...createdDeal,
        supplyContractName: 'change this field',
      };

      const { status, body } = await put(updatedDeal, superuser)
        .to(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
    });

    it('returns the updated deal', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const createdDeal = postResult.body;
      const updatedDeal = {
        ...createdDeal,
        supplyContractName: 'change this field',
      };

      const { status, body } = await put(updatedDeal, user1).to(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body).toEqual(expectAddedFields(updatedDeal));
    });

    it('updates the deal', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const createdDeal = postResult.body;
      const updatedDeal = {
        ...createdDeal,
        supplyContractName: 'change this field',
      }
      await put(updatedDeal, user1).to(`/v1/deals/${createdDeal._id}`);

      const { status, body } = await get(
        `/v1/deals/${createdDeal._id}`,
        user1,
      );

      expect(status).toEqual(200);
      expect(body).toEqual(expectAddedFields(updatedDeal));
    });
  });

  describe('DELETE /v1/deals/:id', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await remove('/v1/deals/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      await post(newDeal, user1).to('/v1/deals');
      const { status } = await remove('/v1/deals/123456789012', aUserWithoutRoles);

      expect(status).toEqual(401);
    });

    it('401s requests from users if <user>.bank != <resource>.details.owningBank', async () => {
      const {body} = await post(newDeal, user1).to('/v1/deals');

      const { status } = await remove(`/v1/deals/${body._id}`, user2);

      expect(status).toEqual(401);
    });

    it('404s requests to delete unkonwn ids', async () => {
      const { status } = await remove('/v1/deals/123456789012', user1);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const {body} = await post(newDeal, user1).to('/v1/deals');

      const { status } = await remove(`/v1/deals/${body._id}`, superuser);

      expect(status).toEqual(200);
    });

    it('deletes the deal', async () => {
      const {body} = await post(newDeal, user1).to('/v1/deals');

      await remove(`/v1/deals/${body._id}`, user1);

      const { status } = await get(
        `/v1/deals/${body._id}`,
        user1,
      );

      expect(status).toEqual(404);
    });
  });
});
