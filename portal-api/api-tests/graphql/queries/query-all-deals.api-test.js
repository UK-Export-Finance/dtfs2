const wipeDB = require('../../wipeDB');
const aDeal = require('../../v1/deals/deal-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);

const dealsQuery = `
query {
  allDeals {
    status {
      code
    }
    count
    deals {
      _id
      status
      bankRef
      exporter
      product
      submissionType
      updatedAt
    }
  }
}`;

const dealsPaginationQuery1 = `
query {
  allDeals(params: { start:2, pagesize: 2}) {
    status {
      code
    }
    count
    deals {
      _id
      status
      bankRef
      exporter
      product
      submissionType
      updatedAt
    }
  }
}`;


const dealsPaginationQuery2 = `
query {
  allDeals(params: { start:5, pagesize: 3}) {
    status {
      code
    }
    count
    deals {
      _id
      status
      bankRef
      exporter
      product
      submissionType
      updatedAt
    }
  }
}`;

const dealsFilterStatusQuery = `
query {
  allDeals(params: { filters: [{ field: "status", value: "Draft"}]}) {
    status {
      code
    }
    count
    deals {
      status
      bankRef
    }
  }
}`;

const dealsFilterStatusPaginatedQuery = `
query {
  allDeals(params: {  start:1, pagesize: 2, filters: [{ field: "status", value: "Draft"}]}) {
    status {
      code
    }
    count
    deals {
      _id
      status
      bankRef
    }
  }
}`;

const dealsFilterNotStatusQuery = `
query {
  allDeals(params: { filters: [{ field: "status", value: "Draft", operator: "ne"}]}) {
    status {
      code
    }
    count
    deals {
      _id
      status
      bankRef
    }
  }
}`;

const queryBody = {
  query: dealsQuery,
};

describe('/graphql query deals', () => {
  let noRoles;
  let anHSBCMaker;
  let aBarclaysMaker;
  let aBarclaysChecker;
  let aSuperuser;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    aBarclaysChecker = testUsers().withRole('checker').withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
  });

  describe('/graphql list all deals', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(queryBody).to('/graphql');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker || role=checker', async () => {
      const { body } = await as(noRoles).post(queryBody).to('/graphql');
      expect(body.data.allDeals.status.code).toEqual(401);
    });

    it('accepts requests that come from a user with role=maker', async () => {
      const { body } = await as(anHSBCMaker).post(queryBody).to('/graphql');
      expect(body.data.allDeals.status.code).toEqual(200);
    });


    it('accepts requests that come from a user with role=checker', async () => {
      const { body } = await as(aBarclaysChecker).post(queryBody).to('/graphql');
      expect(body.data.allDeals.status.code).toEqual(200);
    });

    it('returns a list of deals ordered by "updated"', async () => {
      const deals = [
        aDeal({ additionalRefName: 'bank1-0', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank1-1', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank1-2', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank2-0', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank2-1', bankInternalRefName: 'mockSupplyContractId' }),
      ];

      await as(aBarclaysMaker).post(deals[4]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[2]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[1]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[0]).to('/v1/deals');
      await as(aBarclaysMaker).post(deals[3]).to('/v1/deals');

      const { body } = await as(anHSBCMaker).post(queryBody).to('/graphql');
      expect(body.data.allDeals.status.code).toEqual(200);

      // expect to see deals in reverse order; most recent on top..
      expect(body.data.allDeals.deals.length).toEqual(deals.length);

      body.data.allDeals.deals.forEach((deal, index) => {
        expect(deal.bankRef).toEqual(deals[index].additionalRefName);
      });
    });

    it('returns a list of deals ordered by "updated" if <user>.bank.id == *', async () => {
      const deals = [
        aDeal({ additionalRefName: 'bank1-0', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank1-1', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank1-2', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank2-0', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank2-1', bankInternalRefName: 'mockSupplyContractId' }),
      ];

      const submitOrder = [4, 1, 2, 0, 3];

      await as(aBarclaysMaker).post(deals[submitOrder[0]]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[submitOrder[1]]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[submitOrder[2]]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[submitOrder[3]]).to('/v1/deals');
      await as(aBarclaysMaker).post(deals[submitOrder[4]]).to('/v1/deals');

      const { body } = await as(aSuperuser).post(queryBody).to('/graphql');
      expect(body.data.allDeals.status.code).toEqual(200);

      // expect deals in reverse order;  most recent should be first..
      submitOrder.reverse();
      body.data.allDeals.deals.forEach((deal, index) => {
        expect(deal.bankRef).toEqual(deals[submitOrder[index]].additionalRefName);
      });
    });
  });

  describe('/graphql list deals pagination', () => {
    it('returns a list of deals, ordered by "updated", paginated by start/pagesize', async () => {
      const deals = [
        aDeal({ additionalRefName: 'bank1-0', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank1-1', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank1-2', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank1-3', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank1-4', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank1-5', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank2-0', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank2-1', bankInternalRefName: 'mockSupplyContractId' }),
      ];

      await as(anHSBCMaker).post(deals[0]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[1]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[2]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[3]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[4]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[5]).to('/v1/deals');

      await as(aBarclaysMaker).post(deals[6]).to('/v1/deals');
      await as(aBarclaysMaker).post(deals[7]).to('/v1/deals');

      const { body } = await as(anHSBCMaker).post({ query: dealsPaginationQuery1 }).to('/graphql');
      expect(body.data.allDeals.status.code).toEqual(200);

      // expect deals in reverse order; most recent first..

      expect(body.data.allDeals.deals[0].bankRef).toEqual(deals[3].additionalRefName);
      expect(body.data.allDeals.deals[1].bankRef).toEqual(deals[2].additionalRefName);

      expect(body.data.allDeals.count).toEqual(6);
    });


    it('returns a list of deals, ordered by "updated", paginated by start/pagesize, if <user>.bank.id == *', async () => {
      const deals = [
        aDeal({ additionalRefName: 'bank1-0', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank1-1', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank1-2', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank1-3', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank1-4', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank1-5', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank2-0', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ additionalRefName: 'bank2-1', bankInternalRefName: 'mockSupplyContractId' }),
      ];

      await as(anHSBCMaker).post(deals[0]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[1]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[2]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[3]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[4]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[5]).to('/v1/deals');

      await as(aBarclaysMaker).post(deals[6]).to('/v1/deals');
      await as(aBarclaysMaker).post(deals[7]).to('/v1/deals');

      //      const { status, body } = await as(aSuperuser).get('/v1/deals/5/3');
      const { body } = await as(aSuperuser).post({ query: dealsPaginationQuery2 }).to('/graphql');
      expect(body.data.allDeals.status.code).toEqual(200);

      // expect deals in reverse order - when we slice the last 3 deals we should get 2/1/0
      expect(body.data.allDeals.deals[0].bankRef).toEqual(deals[2].additionalRefName);
      expect(body.data.allDeals.deals[1].bankRef).toEqual(deals[1].additionalRefName);
      expect(body.data.allDeals.deals[2].bankRef).toEqual(deals[0].additionalRefName);


      expect(body.data.allDeals.count).toEqual(8);
    });
  });

  describe('/graphql list deals filters', () => {
    it('returns a list of deals, ordered by "updated", filtered by equal filters', async () => {
      const deals = [
        aDeal({ status: 'Draft', additionalRefName: 'bank1-0', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Draft', additionalRefName: 'bank1-1', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Draft', additionalRefName: 'bank1-2', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Draft', additionalRefName: 'bank1-3', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Submitted',  additionalRefName: 'bank1-4', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Draft', additionalRefName: 'bank1-5', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Acknowledged by UKEF', additionalRefName: 'bank2-0', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Acknowledged by UKEF', additionalRefName: 'bank2-1', bankInternalRefName: 'mockSupplyContractId' }),
      ];

      await as(anHSBCMaker).post(deals[0]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[1]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[2]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[3]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[4]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[5]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[6]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[7]).to('/v1/deals');

      //      const { status, body } = await as(anHSBCMaker).get('/v1/deals/2/2');
      const { body } = await as(anHSBCMaker).post({ query: dealsFilterStatusQuery }).to('/graphql');

      expect(body.data.allDeals.status.code).toEqual(200);

      // expect deals in reverse order; most recent first..
      expect(body.data.allDeals.deals.every((deal) => deal.status === 'Draft')).toBe(true);

      expect(body.data.allDeals.deals[0].bankRef).toEqual(deals[5].additionalRefName);
      expect(body.data.allDeals.deals[1].bankRef).toEqual(deals[3].additionalRefName);
      expect(body.data.allDeals.deals[2].bankRef).toEqual(deals[2].additionalRefName);
      expect(body.data.allDeals.deals[3].bankRef).toEqual(deals[1].additionalRefName);
      expect(body.data.allDeals.deals[4].bankRef).toEqual(deals[0].additionalRefName);

      expect(body.data.allDeals.count).toEqual(5);
    });

    it('returns a list of deals, ordered by "updated", paginated and filtered by equal filters', async () => {
      const deals = [
        aDeal({ status: 'Draft', additionalRefName: 'bank1-0', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Draft', additionalRefName: 'bank1-1', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Draft', additionalRefName: 'bank1-2', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Draft', additionalRefName: 'bank1-3', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Submitted', additionalRefName: 'bank1-4', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Draft', additionalRefName: 'bank1-5', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Acknowledged by UKEF', additionalRefName: 'bank2-0', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Acknowledged by UKEF', additionalRefName: 'bank2-1', bankInternalRefName: 'mockSupplyContractId' }),
      ];

      await as(anHSBCMaker).post(deals[0]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[1]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[2]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[3]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[4]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[5]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[6]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[7]).to('/v1/deals');

      //      const { status, body } = await as(anHSBCMaker).get('/v1/deals/2/2');
      const { body } = await as(anHSBCMaker).post({ query: dealsFilterStatusPaginatedQuery }).to('/graphql');

      expect(body.data.allDeals.status.code).toEqual(200);

      // expect deals of 2nd page in reverse order; most recent first..
      expect(body.data.allDeals.deals.every((deal) => deal.status === 'Draft')).toBe(true);
      expect(body.data.allDeals.deals[0].bankRef).toEqual(deals[3].additionalRefName);
      expect(body.data.allDeals.deals[1].bankRef).toEqual(deals[2].additionalRefName);

      expect(body.data.allDeals.count).toEqual(5);
    });

    it('returns a list of deals, ordered by "updated", filtered by not equal filter', async () => {
      const deals = [
        aDeal({ status: 'Draft', additionalRefName: 'bank1-0', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Draft', additionalRefName: 'bank1-1', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Draft', additionalRefName: 'bank1-2', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Draft', additionalRefName: 'bank1-3', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Submitted', additionalRefName: 'bank1-4', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Draft', additionalRefName: 'bank1-5', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Acknowledged by UKEF', additionalRefName: 'bank2-0', bankInternalRefName: 'mockSupplyContractId' }),
        aDeal({ status: 'Acknowledged by UKEF', additionalRefName: 'bank2-1', bankInternalRefName: 'mockSupplyContractId' }),
      ];

      await as(anHSBCMaker).post(deals[0]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[1]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[2]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[3]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[4]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[5]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[6]).to('/v1/deals');
      await as(anHSBCMaker).post(deals[7]).to('/v1/deals');

      //      const { status, body } = await as(anHSBCMaker).get('/v1/deals/2/2');
      const { body } = await as(anHSBCMaker).post({ query: dealsFilterNotStatusQuery }).to('/graphql');

      expect(body.data.allDeals.status.code).toEqual(200);

      // expect deals in reverse order; most recent first..
      expect(body.data.allDeals.deals[0].bankRef).toEqual(deals[7].additionalRefName);
      expect(body.data.allDeals.deals[1].bankRef).toEqual(deals[6].additionalRefName);
      expect(body.data.allDeals.deals[2].bankRef).toEqual(deals[4].additionalRefName);

      expect(body.data.allDeals.count).toEqual(3);
    });
  });
});
