const wipeDB = require('../../wipeDB');
const aDeal = require('../../v1/deals/deal-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);

const dealsQuery = `
query {
  allDeals {
    count
    deals {
      _id
      status
      bankInternalRefName
      exporter
      product
      submissionType
      updatedAt
    }
  }
}`;

const dealsPaginationQuery = `
query {
  allDeals(params: { start:5, pagesize: 3}) {
    count
    deals {
      _id
      status
      bankInternalRefName
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
    count
    deals {
      status
      bankInternalRefName
    }
  }
}`;

const dealsFilterNotStatusQuery = `
query {
  allDeals(params: { filters: [{ field: "status", value: "Draft", operator: "ne"}]}) {
    count
    deals {
      _id
      status
      bankInternalRefName
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

  const mockDeals = [
    aDeal({ bankInternalRefName: 'bank1-0', status: 'Draft' }),
    aDeal({ bankInternalRefName: 'bank1-1', status: 'Draft' }),
    aDeal({ bankInternalRefName: 'bank1-2', status: 'Draft' }),
    aDeal({ bankInternalRefName: 'bank1-3', status: 'Draft' }),

    aDeal({ bankInternalRefName: 'bank1-4', status: 'Submitted' }),
    aDeal({ bankInternalRefName: 'bank1-5', status: 'Submitted' }),

    aDeal({ bankInternalRefName: 'bank2-0', status: 'Acknowledged by UKEF' }),
    aDeal({ bankInternalRefName: 'bank2-1', status: 'Acknowledged by UKEF' }),
  ];

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    aBarclaysChecker = testUsers().withRole('checker').withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aSuperuser = testUsers().superuser().one();

    await as(anHSBCMaker).post(mockDeals[0]).to('/v1/deals');
    await as(anHSBCMaker).post(mockDeals[1]).to('/v1/deals');
    await as(anHSBCMaker).post(mockDeals[2]).to('/v1/deals');
    await as(anHSBCMaker).post(mockDeals[3]).to('/v1/deals');
    await as(anHSBCMaker).post(mockDeals[4]).to('/v1/deals');
    await as(anHSBCMaker).post(mockDeals[5]).to('/v1/deals');
    await as(aBarclaysMaker).post(mockDeals[6]).to('/v1/deals');
    await as(aBarclaysMaker).post(mockDeals[7]).to('/v1/deals');
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

    it('does not return any deals if the user does not have a maker or checker role', async () => {
      // const deal = aDeal({ additionalRefName: 'bank1-0', bankInternalRefName: 'mockSupplyContractId' });
      // await as(anHSBCMaker).post(deal).to('/v1/deals');

      const { status, body } = await as(noRoles).post(queryBody).to('/graphql');

      expect(status).toEqual(200);
      expect(body.data.allDeals.count).toEqual(null);
      expect(body.data.allDeals.deals).toEqual(null);
    });

    it('returns deals when the user has maker role', async () => {
      const { status, body } = await as(anHSBCMaker).post(queryBody).to('/graphql');

      expect(status).toEqual(200);
      expect(body.data.allDeals.count).not.toBeNull();
      expect(body.data.allDeals.deals).not.toBeNull();
    });

    it('returns deals when the user has checker role', async () => {
      const { status, body } = await as(aBarclaysChecker).post(queryBody).to('/graphql');

      expect(status).toEqual(200);
      expect(body.data.allDeals.count).not.toBeNull();
      expect(body.data.allDeals.deals).not.toBeNull();
    });

    it('returns all created deals', async () => {
      const { body, status } = await as(aSuperuser).post(queryBody).to('/graphql');
      expect(status).toEqual(200);

      mockDeals.forEach((mockDeal) => {
        const dealExists = body.data.allDeals.deals.find((d) =>
          d.bankInternalRefName === mockDeal.bankInternalRefName);
        expect(dealExists).toBeDefined();
      });
    });
  });

  describe('/graphql list deals pagination', () => {
    it('returns a list of deals paginated by start/pagesize', async () => {
      const { body, status } = await as(aSuperuser).post({ query: dealsPaginationQuery }).to('/graphql');
      expect(status).toEqual(200);

      // dealsPaginationQuery pageSize is 3, so the total count should be greater than this.
      expect(body.data.allDeals.count).toBeGreaterThan(3);

      // actual deals returned should equal the pageSize.
      expect(body.data.allDeals.deals.length).toEqual(3);
      expect(body.data.allDeals.count).toEqual(8);
    });
  });

  describe('/graphql list deals filters', () => {
    it('returns a list of deals filtered by equal filters', async () => {
      const { status, body } = await as(anHSBCMaker).post({ query: dealsFilterStatusQuery }).to('/graphql');

      expect(status).toEqual(200);

      expect(body.data.allDeals.deals.every((deal) => deal.status === 'Draft')).toBe(true);

      const totalDraftDeals = mockDeals.filter((mockDeal) => mockDeal.status === 'Draft').length;
      expect(body.data.allDeals.count).toEqual(totalDraftDeals);
    });

    it('returns a list of deals filtered by NOT equal filter', async () => {
      const { status, body } = await as(anHSBCMaker).post({ query: dealsFilterNotStatusQuery }).to('/graphql');

      expect(status).toEqual(200);

      expect(body.data.allDeals.deals.every((deal) => deal.status !== 'Draft')).toBe(true);

      const totalNonDraftDeals = mockDeals.filter((mockDeal) => mockDeal.status !== 'Draft').length;
      expect(body.data.allDeals.count).toEqual(totalNonDraftDeals);
    });
  });
});
