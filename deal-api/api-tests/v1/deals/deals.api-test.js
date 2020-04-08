const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../../src/createApp');
const {
  get, post, put, remove,
} = require('../../api')(app);

const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');

const getToken = require('../../getToken')(app);

describe('/v1/deals', () => {
  const newDeal = aDeal({
    details: {
      bankSupplyContractName: 'Original Value'
    },
  });

  let aUserWithoutRoles;
  let maker1;
  let maker2;
  let checker;

  beforeEach(async () => {
    await wipeDB();

    aUserWithoutRoles = await getToken({
      username: '1',
      password: '2',
      roles: [],
    });

    maker1 = await getToken({
      username: '3',
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

  describe('GET /v1/deals', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/deals');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker || role=checker', async () => {
      const { status } = await get('/v1/deals', aUserWithoutRoles);

      expect(status).toEqual(401);
    });

    it('accepts requests that come from a user with role=maker', async () => {
      const { status } = await get('/v1/deals', maker1);

      expect(status).toEqual(200);
    });

    it('accepts requests that come from a user with role=checker', async () => {
      const { status } = await get('/v1/deals', checker);

      expect(status).toEqual(200);
    });

    it('returns a list of deals ordered by "updated", filtered by <user>.bank.id', async () => {
      const deals = [
        aDeal({ details: {bankSupplyContractName: 'bank1/0' }}),
        aDeal({ details: {bankSupplyContractName: 'bank1/1' }}),
        aDeal({ details: {bankSupplyContractName: 'bank1/2' }}),
        aDeal({ details: {bankSupplyContractName: 'bank2/0' }}),
        aDeal({ details: {bankSupplyContractName: 'bank2/1' }}),
      ];

      await post(deals[4], maker2).to('/v1/deals');
      await post(deals[1], maker1).to('/v1/deals');
      await post(deals[2], maker1).to('/v1/deals');
      await post(deals[0], maker1).to('/v1/deals');
      await post(deals[3], maker2).to('/v1/deals');

      let { status, body } = await get('/v1/deals', maker1);

      expect(status).toEqual(200);
      expect(body.deals).toEqual(expectAllAddedFields([
        deals[1],
        deals[2],
        deals[0]
      ]));

    });

    it('returns a list of deals ordered by "updated" if <user>.bank.id == *', async () => {
      const deals = [
        aDeal({ details: {bankSupplyContractName: 'bank1/0' }}),
        aDeal({ details: {bankSupplyContractName: 'bank1/1' }}),
        aDeal({ details: {bankSupplyContractName: 'bank1/2' }}),
        aDeal({ details: {bankSupplyContractName: 'bank2/0' }}),
        aDeal({ details: {bankSupplyContractName: 'bank2/1' }}),
      ];

      await post(deals[4], maker2).to('/v1/deals');
      await post(deals[1], maker1).to('/v1/deals');
      await post(deals[2], maker1).to('/v1/deals');
      await post(deals[0], maker1).to('/v1/deals');
      await post(deals[3], maker2).to('/v1/deals');

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

    it('401s requests that do not come from a user with role=maker || role=checker', async () => {
      const { status } = await get('/v1/deals/0/1', aUserWithoutRoles);

      expect(status).toEqual(401);
    });

    it('accepts requests that come from a user with role=maker', async () => {
      const { status } = await get('/v1/deals/0/1', maker1);

      expect(status).toEqual(200);
    });

    it('accepts requests that come from a user with role=checker', async () => {
      const { status } = await get('/v1/deals/0/1', checker);

      expect(status).toEqual(200);
    });

    it('returns a list of deals, ordered by "updated", paginated by start/pagesize, filtered by <user>.bank.id', async () => {
      const deals = [
        aDeal({ details: {bankSupplyContractName: 'bank1/0' }}),
        aDeal({ details: {bankSupplyContractName: 'bank1/1' }}),
        aDeal({ details: {bankSupplyContractName: 'bank1/2' }}),
        aDeal({ details: {bankSupplyContractName: 'bank1/3' }}),
        aDeal({ details: {bankSupplyContractName: 'bank1/4' }}),
        aDeal({ details: {bankSupplyContractName: 'bank1/5' }}),
        aDeal({ details: {bankSupplyContractName: 'bank2/0' }}),
        aDeal({ details: {bankSupplyContractName: 'bank2/1' }}),
      ];

      await post(deals[0], maker1).to('/v1/deals');
      await post(deals[1], maker1).to('/v1/deals');
      await post(deals[2], maker1).to('/v1/deals');
      await post(deals[3], maker1).to('/v1/deals');
      await post(deals[4], maker1).to('/v1/deals');
      await post(deals[5], maker1).to('/v1/deals');

      await post(deals[6], maker2).to('/v1/deals');
      await post(deals[7], maker2).to('/v1/deals');

      const { status, body } = await get('/v1/deals/2/2', maker1);

      expect(status).toEqual(200);
      expect(body.deals).toEqual(expectAllAddedFields([
        deals[2],
        deals[3],
      ]));

      expect(body.count).toEqual(6);
    });

    it('returns a list of deals, ordered by "updated", paginated by start/pagesize, if <user>.bank.id == *', async () => {
      const deals = [
        aDeal({ details: {bankSupplyContractName: 'bank1/0' }}),
        aDeal({ details: {bankSupplyContractName: 'bank1/1' }}),
        aDeal({ details: {bankSupplyContractName: 'bank1/2' }}),
        aDeal({ details: {bankSupplyContractName: 'bank1/3' }}),
        aDeal({ details: {bankSupplyContractName: 'bank1/4' }}),
        aDeal({ details: {bankSupplyContractName: 'bank1/5' }}),
        aDeal({ details: {bankSupplyContractName: 'bank2/0' }}),
        aDeal({ details: {bankSupplyContractName: 'bank2/1' }}),
      ];

      await post(deals[0], maker1).to('/v1/deals');
      await post(deals[1], maker1).to('/v1/deals');
      await post(deals[2], maker1).to('/v1/deals');
      await post(deals[3], maker1).to('/v1/deals');
      await post(deals[4], maker1).to('/v1/deals');
      await post(deals[5], maker1).to('/v1/deals');

      await post(deals[6], maker2).to('/v1/deals');
      await post(deals[7], maker2).to('/v1/deals');

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
      const {body} = await post(newDeal, maker1).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}`, maker2);

      expect(status).toEqual(401);
    });

    it('404s requests for unkonwn ids', async () => {
      const { status } = await get(`/v1/deals/123456789012`, maker2);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const {body} = await post(newDeal, maker1).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}`, superuser);

      expect(status).toEqual(200);
    });

    it('returns the requested resource', async () => {
      const postResult = await post(newDeal, maker1).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await get(`/v1/deals/${newId}`, maker1);

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
      const { body, status } = await post(newDeal, maker1).to(
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
      const {body} = await post(newDeal, maker1).to('/v1/deals');

      const updatedDeal = {
        ...body,
        bankSupplyContractName: 'change this field',
      }

      const {status} = await put(updatedDeal, maker2).to(`/v1/deals/${body._id}`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await put(newDeal, maker1).to(
        '/v1/deals/123456789012',
      );

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await post(newDeal, maker1).to('/v1/deals');
      const createdDeal = postResult.body;
      const updatedDeal = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          bankSupplyContractName: 'change this field',
        }
      };

      const { status, body } = await put(updatedDeal, superuser)
        .to(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
    });

    it('returns the updated deal', async () => {
      const postResult = await post(newDeal, maker1).to('/v1/deals');
      const createdDeal = postResult.body;
      const updatedDeal = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          bankSupplyContractName: 'change this field',
        }
      };

      const { status, body } = await put(updatedDeal, maker1).to(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body).toEqual(expectAddedFields(updatedDeal));
    });

    it('handles partial updates', async () => {
      const postResult = await post(newDeal, maker1).to('/v1/deals');
      const createdDeal = postResult.body;

      const partialUpdate = {
        details: {
          bankSupplyContractName: 'change this field',
        }
      }

      const expectedDataIncludingUpdate = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          bankSupplyContractName: 'change this field',
        }
      };

      const { status, body } = await put(partialUpdate, maker1).to(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body).toEqual(expectAddedFields(expectedDataIncludingUpdate));
    });

    it('updates the deal', async () => {
      const postResult = await post(newDeal, maker1).to('/v1/deals');
      const createdDeal = postResult.body;
      const updatedDeal = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          bankSupplyContractName: 'change this field',
        }
      };
      await put(updatedDeal, maker1).to(`/v1/deals/${createdDeal._id}`);

      const { status, body } = await get(
        `/v1/deals/${createdDeal._id}`,
        maker1,
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
      await post(newDeal, maker1).to('/v1/deals');
      const { status } = await remove('/v1/deals/123456789012', aUserWithoutRoles);

      expect(status).toEqual(401);
    });

    it('401s requests from users if <user>.bank != <resource>.details.owningBank', async () => {
      const {body} = await post(newDeal, maker1).to('/v1/deals');

      const { status } = await remove(`/v1/deals/${body._id}`, maker2);

      expect(status).toEqual(401);
    });

    it('404s requests to delete unkonwn ids', async () => {
      const { status } = await remove('/v1/deals/123456789012', maker1);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const {body} = await post(newDeal, maker1).to('/v1/deals');

      const { status } = await remove(`/v1/deals/${body._id}`, superuser);

      expect(status).toEqual(200);
    });

    it('deletes the deal', async () => {
      const {body} = await post(newDeal, maker1).to('/v1/deals');

      await remove(`/v1/deals/${body._id}`, maker1);

      const { status } = await get(
        `/v1/deals/${body._id}`,
        maker1,
      );

      expect(status).toEqual(404);
    });
  });

  describe('POST /v1/deals/:id/clone', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await post(newDeal).to('/v1/deals/123456789012/clone');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await post(newDeal, aUserWithoutRoles).to(
        '/v1/deals/123456789012/clone',
      );

      expect(status).toEqual(401);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await post(newDeal, maker1).to(
        '/v1/deals/123456789012/clone',
      );
      expect(status).toEqual(404);
    });

    describe('with post body', () => {
      let originalDealId;

      beforeEach(async () => {
        const { body: originalDealBody } = await post(newDeal, maker1).to('/v1/deals');
        originalDealId = originalDealBody._id;
      });

      it('clones a deal with modified _id, bankDealId and bankDealName', async () => {
        const clonePostBody = {
          bankSupplyContractID: 'new-bank-deal-id',
          bankSupplyContractName: 'new-bank-deal-name',
          cloneTransactions: 'true',
        };

        const { body } = await post(clonePostBody, maker1).to(`/v1/deals/${originalDealId}/clone`);

        expect(body._id).not.toEqual(clonePostBody.bankDealId);
        expect(body.details.bankSupplyContractID).toEqual(clonePostBody.bankSupplyContractID);
        expect(body.details.bankSupplyContractName).toEqual(clonePostBody.bankSupplyContractName);
      });

      describe('when req.body has cloneTransactions set to false', () => {
        it('clones a deal with empty transactions', async () => {
          const clonePostBody = {
            bankSupplyContractID: 'new-bank-deal-id',
            bankSupplyContractName: 'new-bank-deal-name',
            cloneTransactions: 'false',
          };
          const { body } = await post(clonePostBody, maker1).to(`/v1/deals/${originalDealId}/clone`);

          expect(body.bondTransactions).toEqual({
            items: [],
          });
          expect(body.loanTransactions).toEqual({
            items: [],
          });
        });
      });

      describe('when required fields are missing', () => {
        it('returns validation errors', async () => {
          const clonePostBody = {
            bankSupplyContractID: '',
            bankSupplyContractName: '',
            cloneTransactions: '',
          };
          const { body } = await post(clonePostBody, maker1).to(`/v1/deals/${originalDealId}/clone`);

          expect(body.validationErrors.count).toEqual(3);
          expect(body.validationErrors.errorList.bankSupplyContractID).toBeDefined();
          expect(body.validationErrors.errorList.bankSupplyContractName).toBeDefined();
          expect(body.validationErrors.errorList.cloneTransactions).toBeDefined();
        });
      });
    });
  });
});
