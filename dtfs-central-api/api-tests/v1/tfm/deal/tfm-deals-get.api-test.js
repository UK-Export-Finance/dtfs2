const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const CONSTANTS = require('../../../../src/constants');
const getObjectPropertyValueFromStringPath = require('../../../../src/utils/getObjectPropertyValueFromStringPath');
const setObjectPropertyValueFromStringPath = require('../../../helpers/set-object-property-value-from-string-path');

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

  describe('sorts deals correctly', () => {
    describe.each([
      {
        fieldPathExcludingDealSnapshotForNonBssDeal: 'ukefDealId',
        fieldPathExcludingDealSnapshotForBssDeal: 'details.ukefDealId',
        fieldValuesInAscendingOrder: ['10000001', '10000002', '10000003', '10000004']
      },
      {
        fieldPathExcludingDealSnapshotForNonBssDeal: 'exporter.companyName',
        fieldPathExcludingDealSnapshotForBssDeal: 'submissionDetails.supplier-name',
        fieldValuesInAscendingOrder: ['A Company', 'B Company', 'C Company', 'D Company']
      },
      {
        fieldPathExcludingDealSnapshotForNonBssDeal: 'buyer.companyName',
        fieldPathExcludingDealSnapshotForBssDeal: 'submissionDetails.buyer-name',
        fieldValuesInAscendingOrder: ['A Company', 'B Company', 'C Company', 'D Company']
      },
      {
        fieldPathExcludingDealSnapshotForNonBssDeal: 'additionalRefName',
        fieldPathExcludingDealSnapshotForBssDeal: 'additionalRefName',
        fieldValuesInAscendingOrder: ['A Ref Name', 'B Ref Name', 'C Ref Name', 'D Ref Name']
      },
    ])('by dealSnapshot.$fieldPathExcludingDealSnapshotForNonBssDeal', (
      {
        fieldPathExcludingDealSnapshotForNonBssDeal: nonBssPath,
        fieldPathExcludingDealSnapshotForBssDeal: bssPath,
        fieldValuesInAscendingOrder: values,
      }
    ) => {
      const gefDeal1Data = { dealType: 'GEF' };
      setObjectPropertyValueFromStringPath(gefDeal1Data, nonBssPath, values[0]);
      const gefDeal1 = newDeal(gefDeal1Data);

      const gefDeal2Data = { dealType: 'GEF' };
      setObjectPropertyValueFromStringPath(gefDeal2Data, nonBssPath, values[2]);
      const gefDeal2 = newDeal(gefDeal2Data);

      const bssDeal1Data = {};
      setObjectPropertyValueFromStringPath(bssDeal1Data, bssPath, values[1]);
      const bssDeal1 = newDeal(bssDeal1Data);

      const bssDeal2Data = {};
      setObjectPropertyValueFromStringPath(bssDeal2Data, bssPath, values[3]);
      const bssDeal2 = newDeal(bssDeal2Data);

      beforeEach(async () => {
        await wipeDB.wipe(['deals']);
        await wipeDB.wipe(['facilities']);
        await wipeDB.wipe(['tfm-deals']);
        await wipeDB.wipe(['tfm-facilities']);
        await createAndSubmitDeals([
          gefDeal1,
          gefDeal2,
          bssDeal1,
          bssDeal2
        ]);
      });

      describe.each([
        'ascending',
        'descending'
      ])('in %s order', (order) => {
        const queryParams = {
          sortBy: {
            order,
            field: `dealSnapshot.${nonBssPath}`
          }
        };

        it('without pagination', async () => {
          const { status, body } = await api.get('/v1/tfm/deals', { queryParams });

          expect(status).toEqual(200);
          expect(body.deals.length).toEqual(4);
          expect(body.pagination.totalItems).toEqual(4);
          expect(body.pagination.currentPage).toEqual(0);
          expect(body.pagination.totalPages).toEqual(1);

          for (let i = 0; i < 4; i += 1) {
            const firstPart = body.deals[order === 'ascending' ? i : 3 - i].dealSnapshot;
            const secondPart = i % 2 === 0 ? nonBssPath : bssPath;
            const fieldValue = getObjectPropertyValueFromStringPath(firstPart, secondPart);

            const expectedFieldValue = values[i];

            expect(fieldValue).toEqual(expectedFieldValue);
          }
        });

        it('with pagination', async () => {
          const pagesize = 2;

          const { status: page1Status, body: page1Body } = await api.get(
            '/v1/tfm/deals',
            { queryParams: { ...queryParams, page: 0, pagesize } }
          );

          expect(page1Status).toEqual(200);
          expect(page1Body.deals.length).toEqual(2);
          expect(page1Body.pagination.totalItems).toEqual(4);
          expect(page1Body.pagination.currentPage).toEqual(0);
          expect(page1Body.pagination.totalPages).toEqual(2);

          if (order === 'ascending') {
            const firstFieldValue = getObjectPropertyValueFromStringPath(
              page1Body.deals[0].dealSnapshot,
              nonBssPath
            );
            expect(firstFieldValue).toEqual(values[0]);

            const secondFieldValue = getObjectPropertyValueFromStringPath(
              page1Body.deals[1].dealSnapshot,
              bssPath
            );
            expect(secondFieldValue).toEqual(values[1]);
          } else {
            const firstFieldValue = getObjectPropertyValueFromStringPath(
              page1Body.deals[0].dealSnapshot,
              bssPath
            );
            expect(firstFieldValue).toEqual(values[3]);

            const secondFieldValue = getObjectPropertyValueFromStringPath(
              page1Body.deals[1].dealSnapshot,
              nonBssPath
            );
            expect(secondFieldValue).toEqual(values[2]);
          }

          const { status: page2Status, body: page2Body } = await api.get(
            '/v1/tfm/deals',
            { queryParams: { ...queryParams, page: 1, pagesize } }
          );

          expect(page2Status).toEqual(200);
          expect(page2Body.deals.length).toEqual(2);
          expect(page2Body.pagination.totalItems).toEqual(4);
          expect(page2Body.pagination.currentPage).toEqual(1);
          expect(page2Body.pagination.totalPages).toEqual(2);

          if (order === 'ascending') {
            const firstFieldValue = getObjectPropertyValueFromStringPath(
              page2Body.deals[0].dealSnapshot,
              nonBssPath
            );
            expect(firstFieldValue).toEqual(values[2]);

            const secondFieldValue = getObjectPropertyValueFromStringPath(
              page2Body.deals[1].dealSnapshot,
              bssPath
            );
            expect(secondFieldValue).toEqual(values[3]);
          } else {
            const firstFieldValue = getObjectPropertyValueFromStringPath(
              page2Body.deals[0].dealSnapshot,
              bssPath
            );
            expect(firstFieldValue).toEqual(values[1]);

            const secondFieldValue = getObjectPropertyValueFromStringPath(
              page2Body.deals[1].dealSnapshot,
              nonBssPath
            );
            expect(secondFieldValue).toEqual(values[0]);
          }
        });
      });
    });
  });
});
