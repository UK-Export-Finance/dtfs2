const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { get, post, put, remove } = require('../../api')(app);
const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');

describe('/v1/deals', () => {
  const newDeal = aDeal({
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
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

  describe('GET /v1/deals', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/deals');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker || role=checker', async () => {
      const { status } = await get('/v1/deals', noRoles.token);

      expect(status).toEqual(401);
    });

    it('accepts requests that come from a user with role=maker', async () => {
      const { status } = await get('/v1/deals', anHSBCMaker.token);

      expect(status).toEqual(200);
    });

    it('accepts requests that come from a user with role=checker', async () => {
      const { status } = await get('/v1/deals', aBarclaysChecker.token);

      expect(status).toEqual(200);
    });

    it('returns a list of deals ordered by "updated", filtered by <user>.bank.id', async () => {
      const deals = [
        aDeal({ details: { bankSupplyContractName: 'bank1/0', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank1/1', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank1/2', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank2/0', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank2/1', bankSupplyContractID: 'mockSupplyContractId' } }),
      ];

      await post(deals[4], aBarclaysMaker.token).to('/v1/deals');
      await post(deals[1], anHSBCMaker.token).to('/v1/deals');
      await post(deals[2], anHSBCMaker.token).to('/v1/deals');
      await post(deals[0], anHSBCMaker.token).to('/v1/deals');
      await post(deals[3], aBarclaysMaker.token).to('/v1/deals');

      let { status, body } = await get('/v1/deals', anHSBCMaker.token);

      expect(status).toEqual(200);
      // expect to see deals in reverse order; most recent on top..
      expect(body.deals).toEqual(expectAllAddedFields([
        deals[0],
        deals[2],
        deals[1],
      ]));

    });

    it('returns a list of deals ordered by "updated" if <user>.bank.id == *', async () => {
      const deals = [
        aDeal({ details: { bankSupplyContractName: 'bank1/0', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank1/1', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank1/2', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank2/0', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank2/1', bankSupplyContractID: 'mockSupplyContractId' } }),
      ];

      await post(deals[4], aBarclaysMaker.token).to('/v1/deals');
      await post(deals[1], anHSBCMaker.token).to('/v1/deals');
      await post(deals[2], anHSBCMaker.token).to('/v1/deals');
      await post(deals[0], anHSBCMaker.token).to('/v1/deals');
      await post(deals[3], aBarclaysMaker.token).to('/v1/deals');

      let { status, body } = await get('/v1/deals', aSuperuser.token);

      expect(status).toEqual(200);
      // expect deals in reverse order;  most recent should be first..
      expect(body.deals).toEqual(expectAllAddedFields([
        deals[3],
        deals[0],
        deals[2],
        deals[1],
        deals[4],
      ]));

    });

  });

  describe('GET /v1/deals/:start/:pagesize', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/deals/0/1');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker || role=checker', async () => {
      const { status } = await get('/v1/deals/0/1', noRoles.token);

      expect(status).toEqual(401);
    });

    it('accepts requests that come from a user with role=maker', async () => {
      const { status } = await get('/v1/deals/0/1', anHSBCMaker.token);

      expect(status).toEqual(200);
    });

    it('accepts requests that come from a user with role=checker', async () => {
      const { status } = await get('/v1/deals/0/1', aBarclaysChecker.token);

      expect(status).toEqual(200);
    });

    it('returns a list of deals, ordered by "updated", paginated by start/pagesize, filtered by <user>.bank.id', async () => {
      const deals = [
        aDeal({ details: { bankSupplyContractName: 'bank1/0', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank1/1', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank1/2', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank1/3', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank1/4', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank1/5', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank2/0', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank2/1', bankSupplyContractID: 'mockSupplyContractId' } }),
      ];

      await post(deals[0], anHSBCMaker.token).to('/v1/deals');
      await post(deals[1], anHSBCMaker.token).to('/v1/deals');
      await post(deals[2], anHSBCMaker.token).to('/v1/deals');
      await post(deals[3], anHSBCMaker.token).to('/v1/deals');
      await post(deals[4], anHSBCMaker.token).to('/v1/deals');
      await post(deals[5], anHSBCMaker.token).to('/v1/deals');

      await post(deals[6], aBarclaysMaker.token).to('/v1/deals');
      await post(deals[7], aBarclaysMaker.token).to('/v1/deals');

      const { status, body } = await get('/v1/deals/2/2', anHSBCMaker.token);

      expect(status).toEqual(200);
      // expect deals in reverse order; most recent first..
      expect(body.deals).toEqual(expectAllAddedFields([
        deals[3],
        deals[2],
      ]));

      expect(body.count).toEqual(6);
    });

    it('returns a list of deals, ordered by "updated", paginated by start/pagesize, if <user>.bank.id == *', async () => {
      const deals = [
        aDeal({ details: { bankSupplyContractName: 'bank1/0', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank1/1', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank1/2', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank1/3', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank1/4', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank1/5', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank2/0', bankSupplyContractID: 'mockSupplyContractId' } }),
        aDeal({ details: { bankSupplyContractName: 'bank2/1', bankSupplyContractID: 'mockSupplyContractId' } }),
      ];

      await post(deals[0], anHSBCMaker.token).to('/v1/deals');
      await post(deals[1], anHSBCMaker.token).to('/v1/deals');
      await post(deals[2], anHSBCMaker.token).to('/v1/deals');
      await post(deals[3], anHSBCMaker.token).to('/v1/deals');
      await post(deals[4], anHSBCMaker.token).to('/v1/deals');
      await post(deals[5], anHSBCMaker.token).to('/v1/deals');

      await post(deals[6], aBarclaysMaker.token).to('/v1/deals');
      await post(deals[7], aBarclaysMaker.token).to('/v1/deals');

      const { status, body } = await get('/v1/deals/5/3', aSuperuser.token);

      expect(status).toEqual(200);
      // expect deals in reverse order - when we slice the last 3 deals we should get 2/1/0
      expect(body.deals).toEqual(expectAllAddedFields([
        deals[2],
        deals[1],
        deals[0],
      ]));

      expect(body.count).toEqual(8);
    });
  });

  describe('GET /v1/deals/:id', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/deals/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker || role=checker', async () => {
      const { status } = await get('/v1/deals/123456789012', noRoles.token);

      expect(status).toEqual(401);
    });

    it('accepts requests from a user with role=maker', async () => {
      const {body} = await post(newDeal, anHSBCMaker.token).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}`, anHSBCMaker.token);

      expect(status).toEqual(200);
    });

    it('accepts requests from a user with role=checker', async () => {
      const {body} = await post(newDeal, aBarclaysMaker.token).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}`, aBarclaysChecker.token);

      expect(status).toEqual(200);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const {body} = await post(newDeal, anHSBCMaker.token).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}`, aBarclaysMaker.token);

      expect(status).toEqual(401);
    });

    it('404s requests for unkonwn ids', async () => {
      const { status } = await get(`/v1/deals/123456789012`, aBarclaysMaker.token);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const {body} = await post(newDeal, anHSBCMaker.token).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}`, aSuperuser.token);

      expect(status).toEqual(200);
    });

    it('returns the requested resource', async () => {
      const postResult = await post(newDeal, anHSBCMaker.token).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await get(`/v1/deals/${newId}`, anHSBCMaker.token);

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
      const { status } = await post(newDeal, noRoles.token).to('/v1/deals');

      expect(status).toEqual(401);
    });

    it('returns the created deal', async () => {
      const { body, status } = await post(newDeal, anHSBCMaker.token).to(
        '/v1/deals',
      );

      expect(status).toEqual(200);
      expect(body).toEqual(expectAddedFields(newDeal));
    });

    describe('when required fields are missing', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          details: {
            bankSupplyContractID: '',
            bankSupplyContractName: '',
          },
        };

        const { body, status } = await post(postBody, anHSBCMaker.token).to(
          '/v1/deals',
        );

        expect(status).toEqual(400);
        expect(body.details.bankSupplyContractID).toEqual(postBody.details.bankSupplyContractID);
        expect(body.details.bankSupplyContractName).toEqual(postBody.details.bankSupplyContractName);
        expect(body.validationErrors.count).toEqual(2);
        expect(body.validationErrors.errorList.bankSupplyContractID).toBeDefined();
        expect(body.validationErrors.errorList.bankSupplyContractName).toBeDefined();
      });
    });

  });

  describe('PUT /v1/deals/:id', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await put(newDeal).to('/v1/deals/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await put(newDeal, noRoles.token).to(
        '/v1/deals/123456789012',
      );

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const {body} = await post(newDeal, anHSBCMaker.token).to('/v1/deals');

      const updatedDeal = {
        ...body,
        bankSupplyContractName: 'change this field',
      }

      const {status} = await put(updatedDeal, aBarclaysMaker.token).to(`/v1/deals/${body._id}`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await put(newDeal, anHSBCMaker.token).to(
        '/v1/deals/123456789012',
      );

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await post(newDeal, anHSBCMaker.token).to('/v1/deals');
      const createdDeal = postResult.body;
      const updatedDeal = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          bankSupplyContractName: 'change this field',
        }
      };

      const { status, body } = await put(updatedDeal, aSuperuser.token)
        .to(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
    });

    it('returns the updated deal', async () => {
      const postResult = await post(newDeal, anHSBCMaker.token).to('/v1/deals');
      const createdDeal = postResult.body;
      const updatedDeal = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          bankSupplyContractName: 'change this field',
        }
      };

      const { status, body } = await put(updatedDeal, anHSBCMaker.token).to(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body).toEqual(expectAddedFields(updatedDeal));
    });

    it('handles partial updates', async () => {
      const postResult = await post(newDeal, anHSBCMaker.token).to('/v1/deals');
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

      const { status, body } = await put(partialUpdate, anHSBCMaker.token).to(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body).toEqual(expectAddedFields(expectedDataIncludingUpdate));
    });

    it('updates the deal', async () => {
      const postResult = await post(newDeal, anHSBCMaker.token).to('/v1/deals');
      const createdDeal = postResult.body;
      const updatedDeal = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          bankSupplyContractName: 'change this field',
        }
      };
      await put(updatedDeal, anHSBCMaker.token).to(`/v1/deals/${createdDeal._id}`);

      const { status, body } = await get(
        `/v1/deals/${createdDeal._id}`,
        anHSBCMaker.token,
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
      await post(newDeal, anHSBCMaker.token).to('/v1/deals');
      const { status } = await remove('/v1/deals/123456789012', noRoles.token);

      expect(status).toEqual(401);
    });

    it('401s requests from users if <user>.bank != <resource>.details.owningBank', async () => {
      const {body} = await post(newDeal, anHSBCMaker.token).to('/v1/deals');

      const { status } = await remove(`/v1/deals/${body._id}`, aBarclaysMaker.token);

      expect(status).toEqual(401);
    });

    it('404s requests to delete unkonwn ids', async () => {
      const { status } = await remove('/v1/deals/123456789012', anHSBCMaker.token);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const {body} = await post(newDeal, anHSBCMaker.token).to('/v1/deals');

      const { status } = await remove(`/v1/deals/${body._id}`, aSuperuser.token);

      expect(status).toEqual(200);
    });

    it('deletes the deal', async () => {
      const {body} = await post(newDeal, anHSBCMaker.token).to('/v1/deals');

      await remove(`/v1/deals/${body._id}`, anHSBCMaker.token);

      const { status } = await get(
        `/v1/deals/${body._id}`,
        anHSBCMaker.token,
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
      const { status } = await post(newDeal, noRoles.token).to(
        '/v1/deals/123456789012/clone',
      );

      expect(status).toEqual(401);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await post(newDeal, anHSBCMaker.token).to(
        '/v1/deals/123456789012/clone',
      );
      expect(status).toEqual(404);
    });

    describe('with post body', () => {
      let originalDealId;

      beforeEach(async () => {
        const { body: originalDealBody } = await post(newDeal, anHSBCMaker.token).to('/v1/deals');
        originalDealId = originalDealBody._id;
      });

      it('clones a deal with modified _id, bankDealId and bankDealName', async () => {
        const clonePostBody = {
          bankSupplyContractID: 'new-bank-deal-id',
          bankSupplyContractName: 'new-bank-deal-name',
          cloneTransactions: 'true',
        };

        const { body } = await post(clonePostBody, anHSBCMaker.token).to(`/v1/deals/${originalDealId}/clone`);

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
          const { body } = await post(clonePostBody, anHSBCMaker.token).to(`/v1/deals/${originalDealId}/clone`);

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
          const { body } = await post(clonePostBody, anHSBCMaker.token).to(`/v1/deals/${originalDealId}/clone`);

          expect(body.validationErrors.count).toEqual(3);
          expect(body.validationErrors.errorList.bankSupplyContractID).toBeDefined();
          expect(body.validationErrors.errorList.bankSupplyContractName).toBeDefined();
          expect(body.validationErrors.errorList.cloneTransactions).toBeDefined();
        });
      });
    });
  });
});
