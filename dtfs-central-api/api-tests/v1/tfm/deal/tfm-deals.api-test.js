const wipeDB = require('../../../wipeDB');
const aDeal = require('../../deal-builder');

const app = require('../../../../src/createApp');
const api = require('../../../api')(app);

const mockUser = {
  _id: '123456789',
  username: 'temp',
  roles: [],
  bank: {
    id: '956',
    name: 'Barclays Bank',
  },
};

const newDeal = (dealOverrides) => ({
  details: {
    bankSupplyContractName: 'mock name',
    bankSupplyContractID: 'mock id',
    ...dealOverrides,
    maker: {
      ...mockUser,
      ...dealOverrides.maker,
    },
  },
  submissionDetails: dealOverrides.submissionDetails,
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{ }],
  },
});

const createAndSubmitDeals = async (deals) => {
  const result = await Promise.all(deals.map(async (deal) => {
    // create deal
    const createResponse = await api.post({
      deal,
      user: deal.details.maker,
    }).to('/v1/portal/deals');

    expect(createResponse.status).toEqual(200);

    // submit deal
    const submitResponse = await api.put({}).to(`/v1/tfm/deals/${createResponse.body._id}/submit`);

    expect(submitResponse.status).toEqual(200);

    return submitResponse.body;
  }));

  return result;
};

describe('/v1/tfm/deals', () => {
  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
    await wipeDB.wipe(['tfm-deals']);
    await wipeDB.wipe(['tfm-facilities']);
  });

  describe('GET /v1/tfm/deals', () => {
    it('returns all deals', async () => {
      const miaDeal = newDeal({
        submissionType: 'Manual Inclusion Application',
      });

      const minDeal = newDeal({
        submissionType: 'Manual Inclusion Notice',
      });

      const ainDeal = newDeal({
        submissionType: 'Automatic Inclusion Notice',
      });

      await createAndSubmitDeals([
        miaDeal,
        minDeal,
        ainDeal,
        ainDeal,
      ]);

      const { status, body } = await api.get('/v1/tfm/deals');

      expect(status).toEqual(200);
      const expectedTotalDeals = 4;
      expect(body.deals.length).toEqual(expectedTotalDeals);
    });

    it('returns deals filtered by ukefDealId', async () => {
      const miaDeal = newDeal({ ukefDealId: 'test-1' });

      const minDeal = newDeal({ ukefDealId: 'test-2' });

      const submittedDeals = await createAndSubmitDeals([
        miaDeal,
        minDeal,
      ]);

      const mockReqBody = {
        searchParams: {
          searchString: miaDeal.details.ukefDealId,
        },
      };

      const { status, body } = await api.get('/v1/tfm/deals', mockReqBody);

      expect(status).toEqual(200);

      const expectedDeals = submittedDeals.filter((deal) =>
        deal.dealSnapshot.details.ukefDealId === miaDeal.details.ukefDealId);

      expect(body.deals.length).toEqual(expectedDeals.length);

      expect(body.deals).toEqual(expectedDeals);
    });

    it('returns deals filtered by maker.bank.name', async () => {
      const miaDeal = newDeal({
        maker: {
          bank: {
            name: 'My Bank',
          },
        },
      });

      const miaDeal2 = newDeal({
        maker: {
          bank: {
            name: 'My Bank',
          },
        },
      });

      const minDeal = newDeal({});

      const submittedDeals = await createAndSubmitDeals([
        miaDeal,
        miaDeal2,
        minDeal,
      ]);

      const mockReqBody = {
        searchParams: {
          searchString: miaDeal.details.maker.bank.name,
        },
      };

      const { status, body } = await api.get('/v1/tfm/deals', mockReqBody);

      expect(status).toEqual(200);

      const expectedDeals = submittedDeals.filter((deal) =>
        deal.dealSnapshot.details.maker.bank.name === miaDeal.details.maker.bank.name);

      expect(body.deals.length).toEqual(expectedDeals.length);

      expect(body.deals).toEqual(expectedDeals);
    });

    it('returns deals filtered by submissionDetails.supplier-name', async () => {
      const miaDeal = newDeal({
        submissionDetails: {
          'supplier-name': 'Test Supplier Name',
        }
      });

      const minDeal = newDeal({});

      const submittedDeals = await createAndSubmitDeals([
        miaDeal,
        minDeal,
      ]);

      const mockReqBody = {
        searchParams: {
          searchString: miaDeal.submissionDetails['supplier-name'],
        },
      };

      const { status, body } = await api.get('/v1/tfm/deals', mockReqBody);

      expect(status).toEqual(200);

      const expectedDeals = submittedDeals.filter((deal) =>
        deal.dealSnapshot.submissionDetails['supplier-name'] === miaDeal.submissionDetails['supplier-name']);

      expect(body.deals.length).toEqual(expectedDeals.length);

      expect(body.deals).toEqual(expectedDeals);
    });

    it('returns deals filtered by submissionType', async () => {
      const ainDeal = newDeal({
        submissionType: 'Automatic Inclusion Notice',
      });

      const miaDeal = newDeal({
        submissionType: 'Manual Inclusion Application',
      });

      const minDeal = newDeal({
        submissionType: 'Manual Inclusion Notice',
      });

      const submittedDeals = await createAndSubmitDeals([
        ainDeal,
        miaDeal,
        minDeal,
      ]);

      const mockReqBody = {
        searchParams: {
          searchString: ainDeal.details.submissionType,
        },
      };

      const { status, body } = await api.get('/v1/tfm/deals', mockReqBody);

      expect(status).toEqual(200);

      const expectedDeals = submittedDeals.filter((deal) =>
        deal.dealSnapshot.details.submissionType === ainDeal.details.submissionType);

      expect(body.deals.length).toEqual(expectedDeals.length);

      expect(body.deals).toEqual(expectedDeals);
    });
  });
});
