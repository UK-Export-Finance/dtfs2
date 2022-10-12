const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const {
  newDeal,
  createAndSubmitDeals,
  updateDealsTfm,
} = require('./tfm-deals-get.api-test');

describe('/v1/tfm/deals', () => {
  beforeEach(async () => {
    await wipeDB.wipe(['deals', 'facilities', 'tfm-deals', 'tfm-facilities']);
  });

  describe('GET /v1/tfm/deals', () => {
    describe('sorting', () => {
      describe('ukefDealId', () => {
        it('returns deals sorted by ukefDealId - ascending', async () => {
          const deal1 = newDeal({
            details: {
              ukefDealId: '1',
            },
          });

          const deal2 = newDeal({
            details: {
              ukefDealId: '2',
            },
          });

          const deal3 = newDeal({
            details: {
              ukefDealId: '3',
            },
          });

          const submittedDeals = await createAndSubmitDeals([
            deal1,
            deal3,
            deal2,
          ]);

          const mockReqBody = {
            queryParams: {
              sortBy: {
                field: 'dealSnapshot.details.ukefDealId',
                order: 'ascending',
              },
            },
          };

          const { status, body } = await api.get('/v1/tfm/deals', mockReqBody);

          expect(status).toEqual(200);

          const submittedDeal1 = submittedDeals.find((d) => d.dealSnapshot.details.ukefDealId === '1');
          const submittedDeal2 = submittedDeals.find((d) => d.dealSnapshot.details.ukefDealId === '2');
          const submittedDeal3 = submittedDeals.find((d) => d.dealSnapshot.details.ukefDealId === '3');

          const expectedDeals = [
            submittedDeal1,
            submittedDeal2,
            submittedDeal3,
          ];

          expect(body.deals.length).toEqual(expectedDeals.length);

          expect(body.deals).toEqual(expectedDeals);
        });

        it('returns deals sorted by ukefDealId - descending', async () => {
          const deal1 = newDeal({
            details: {
              ukefDealId: '1',
            },
          });
          const deal2 = newDeal({
            details: {
              ukefDealId: '2',
            },
          });
          const deal3 = newDeal({
            details: {
              ukefDealId: '3',
            },
          });

          const submittedDeals = await createAndSubmitDeals([
            deal1,
            deal3,
            deal2,
          ]);

          const mockReqBody = {
            queryParams: {
              sortBy: {
                field: 'dealSnapshot.details.ukefDealId',
                order: 'descending',
              },
            },
          };

          const { status, body } = await api.get('/v1/tfm/deals', mockReqBody);

          expect(status).toEqual(200);

          const submittedDeal1 = submittedDeals.find((d) => d.dealSnapshot.details.ukefDealId === '1');
          const submittedDeal2 = submittedDeals.find((d) => d.dealSnapshot.details.ukefDealId === '2');
          const submittedDeal3 = submittedDeals.find((d) => d.dealSnapshot.details.ukefDealId === '3');

          const expectedDeals = [
            submittedDeal3,
            submittedDeal2,
            submittedDeal1,
          ];

          expect(body.deals.length).toEqual(expectedDeals.length);

          expect(body.deals).toEqual(expectedDeals);
        });
      });

      describe('tfm.product', () => {
        // NOTE: deal.tfm is only generated when we update a deal, after deal submission.
        // Therefore we need to do the following in order to test sorting on fields inside deal.tfm:
        // 1) create deals
        // 2) submit deals
        // 3) update deals

        let submittedDeals;
        let submittedDealWith1Bond;
        let submittedDealWith1Loan;
        let submittedDealWithBondAndLoans;

        // create mock deal objects
        const deal1 = newDeal({ details: { ukefDealId: '1-BOND' } });
        const deal2 = newDeal({ details: { ukefDealId: '1-LOAN' } });
        const deal3 = newDeal({ details: { ukefDealId: '1-BOND-1-LOAN' } });

        const deal1TfmUpdate = { product: 'BSS' };
        const deal2TfmUpdate = { product: 'EWCS' };
        const deal3TfmUpdate = { product: 'BSS & EWCS' };

        beforeEach(async () => {
          submittedDeals = await createAndSubmitDeals([
            deal1,
            deal3,
            deal2,
          ]);

          submittedDealWith1Bond = submittedDeals.find((d) => d.dealSnapshot.details.ukefDealId === '1-BOND');
          submittedDealWith1Loan = submittedDeals.find((d) => d.dealSnapshot.details.ukefDealId === '1-LOAN');
          submittedDealWithBondAndLoans = submittedDeals.find((d) => d.dealSnapshot.details.ukefDealId === '1-BOND-1-LOAN');

          await updateDealsTfm([
            {
              _id: submittedDealWith1Bond._id,
              tfm: deal1TfmUpdate,
            },
            {
              _id: submittedDealWith1Loan._id,
              tfm: deal2TfmUpdate,
            },
            {
              _id: submittedDealWithBondAndLoans._id,
              tfm: deal3TfmUpdate,
            },
          ]);
        });

        it('returns deals sorted by tfm.product - ascending', async () => {
          const mockReqBody = {
            queryParams: {
              sortBy: {
                field: 'tfm.product',
                order: 'ascending',
              },
            },
          };

          const { status, body } = await api.get('/v1/tfm/deals', mockReqBody);

          expect(status).toEqual(200);

          // assert deals ordering based on mock id we create. Simpler than mapping/filtering deals again.
          const expectedDeals = [
            { _id: submittedDealWith1Bond._id },
            { _id: submittedDealWithBondAndLoans._id },
            { _id: submittedDealWith1Loan._id },
          ];

          const getDealsOnlyIds = body.deals.map((d) => ({
            _id: d._id,
          }));

          expect(getDealsOnlyIds.length).toEqual(expectedDeals.length);

          expect(getDealsOnlyIds).toEqual(expectedDeals);
        });

        it('returns deals sorted by tfm.product - descending', async () => {
          const mockReqBody = {
            queryParams: {
              sortBy: {
                field: 'tfm.product',
                order: 'descending',
              },
            },
          };

          const { status, body } = await api.get('/v1/tfm/deals', mockReqBody);

          expect(status).toEqual(200);

          // assert deals ordering based on mock id we create. Simpler than mapping/filtering deals again.
          const expectedDeals = [
            { _id: submittedDealWith1Loan._id },
            { _id: submittedDealWithBondAndLoans._id },
            { _id: submittedDealWith1Bond._id },
          ];

          const getDealsOnlyIds = body.deals.map((d) => ({
            _id: d._id,
          }));

          expect(getDealsOnlyIds.length).toEqual(expectedDeals.length);

          expect(getDealsOnlyIds).toEqual(expectedDeals);
        });
      });
    });
  });
});
