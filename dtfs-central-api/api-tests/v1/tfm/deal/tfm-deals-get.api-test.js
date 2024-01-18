const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const CONSTANTS = require('../../../../src/constants');

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
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
  dealType: 'BSS/EWCS',
  maker: {
    ...mockUser,
    ...dealOverrides.maker ? dealOverrides.maker : {},
  },
  details: {
    ...dealOverrides.details,
  },
  submissionDetails: dealOverrides.submissionDetails,
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{ }],
    ...dealOverrides.eligibility,
  },
  bondTransactions: dealOverrides.bondTransactions,
  loanTransactions: dealOverrides.loanTransactions,
  ...dealOverrides,
});
module.exports.newDeal = newDeal;

const createAndSubmitDeals = async (deals) => {
  const result = await Promise.all(deals.map(async (deal) => {
    // create deal
    const createResponse = await api.post({
      deal,
      user: deal.maker,
    }).to('/v1/portal/deals');

    expect(createResponse.status).toEqual(200);

    // submit deal
    const submitResponse = await api.put({
      dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
      dealId: createResponse.body._id,
    }).to('/v1/tfm/deals/submit');

    expect(submitResponse.status).toEqual(200);

    return submitResponse.body;
  }));

  return result;
};
module.exports.createAndSubmitDeals = createAndSubmitDeals;

const updateDealsTfm = async (dealsTfmUpdate) => {
  const result = await Promise.all(dealsTfmUpdate.map(async (deal) => {
    const updateResponse = await api.put({
      dealUpdate: {
        tfm: deal.tfm,
      },
    }).to(`/v1/tfm/deals/${deal._id}`);

    expect(updateResponse.status).toEqual(200);
    return updateResponse.body;
  }));

  return result;
};
module.exports.updateDealsTfm = updateDealsTfm;

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
      expect(body.pagination.totalItems).toEqual(expectedTotalDeals);
      expect(body.pagination.currentPage).toEqual(0);
      expect(body.pagination.totalPages).toEqual(1);
    });
  });

  it('paginates deals correctly', async () => {
    const miaDeal = newDeal({
      submissionType: 'Manual Inclusion Application',
    });

    const deals = Array(5).fill(miaDeal);
    const pagesize = 4;

    await createAndSubmitDeals(deals);

    const queryParams = { page: 0, pagesize };
    const { status: page1Status, body: page1Body } = await api.get('/v1/tfm/deals', { queryParams });

    expect(page1Status).toEqual(200);
    expect(page1Body.deals.length).toEqual(4);
    expect(page1Body.pagination.totalItems).toEqual(deals.length);
    expect(page1Body.pagination.currentPage).toEqual(0);
    expect(page1Body.pagination.totalPages).toEqual(2);

    queryParams.page = 1;
    const { status: page2Status, body: page2Body } = await api.get('/v1/tfm/deals', { queryParams });

    expect(page2Status).toEqual(200);
    expect(page2Body.deals.length).toEqual(1);
    expect(page2Body.pagination.totalItems).toEqual(deals.length);
    expect(page2Body.pagination.currentPage).toEqual(1);
    expect(page2Body.pagination.totalPages).toEqual(2);
  });
});
