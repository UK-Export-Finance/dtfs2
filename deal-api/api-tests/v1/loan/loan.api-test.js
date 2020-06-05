const wipeDB = require('../../wipeDB');
const aDeal = require('../deals/deal-builder');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);

describe('/v1/deals/:id/loan', () => {
  const newDeal = aDeal({
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
    },
  });

  let noRoles;
  let aBarclaysMaker;
  let anHSBCMaker;
  let aSuperuser;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);

    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
  });

  describe('GET /v1/deals/:id/loan/:id', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/deals/123456789012/loan/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).get('/v1/deals/123456789012/loan/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/loan/123456789012`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown deal', async () => {
      const { status } = await as(aBarclaysMaker).get('/v1/deals/123456789012/loan/123456789012');

      expect(status).toEqual(404);
    });

    it('404s requests for unknown loan', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/loan/123456789012`);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const createLoanResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
      const { loanId } = createLoanResponse.body;

      const { status } = await as(aSuperuser).get(`/v1/deals/${dealId}/loan/${loanId}`);

      expect(status).toEqual(200);
    });

    // it('returns a loan with dealId, `Incomplete` status and validationErrors', async () => {
    //   const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
    //   const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

    //   const createLoanResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
    //   const { loanId } = createLoanResponse.body;

    //   const { status, body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/loan/${loanId}`);

    //   expect(status).toEqual(200);
    //   expect(body.loan._id).toEqual(loanId); // eslint-disable-line no-underscore-dangle
    //   expect(body.loan.status).toEqual('Incomplete');
    //   expect(body.dealId).toEqual(dealId);
    // });

    // describe('when a loan has all required fields', () => {

    // });
  });

  describe('PUT /v1/deals/:id/loan/create', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put().to('/v1/deals/123456789012/loan/create');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).put().to('/v1/deals/123456789012/loan/create');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await as(anHSBCMaker).put().to(`/v1/deals/${dealId}/loan/create`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown resources', async () => {
      const { status } = await as(aBarclaysMaker).put().to('/v1/deals/123456789012/loan/create');

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await as(aSuperuser).put({}).to(`/v1/deals/${dealId}/loan/create`);

      expect(status).toEqual(200);
    });

    it('creates incremental integer loan IDs', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
      const { body } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);

      const loanIds = body.loanTransactions.items.map((loan) => loan._id);

      expect(loanIds[1] - loanIds[0]).toEqual(1);
      expect(loanIds[2] - loanIds[1]).toEqual(1);
    });

    it('adds an empty loan to a deal', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);

      const { status, body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.loanTransactions.items.length).toEqual(1);
      expect(body.loanTransactions.items[0]._id).toBeDefined(); // eslint-disable-line no-underscore-dangle
    });

    it('adds an empty loan to a deal whilst retaining existing loans', async () => {
      const mockLoan = { _id: '123456789012' };
      const newDealWithExistingLoans = {
        ...newDeal,
        loanTransactions: {
          items: [
            mockLoan,
          ],
        },
      };

      const postResult = await as(aBarclaysMaker).post(newDealWithExistingLoans).to('/v1/deals/');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);

      const { status, body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.loanTransactions.items.length).toEqual(2);
    });
  });
});
