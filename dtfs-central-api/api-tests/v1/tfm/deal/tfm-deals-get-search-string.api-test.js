const { sub, format } = require('date-fns');
const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const {
  newDeal,
  createAndSubmitDeals,
} = require('./tfm-deals-get.api-test');

describe('/v1/tfm/deals', () => {
  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
    await wipeDB.wipe(['tfm-deals']);
    await wipeDB.wipe(['tfm-facilities']);
  });

  describe('GET /v1/tfm/deals', () => {
    describe('filter by search string', () => {
      it('returns deals filtered by ukefDealId', async () => {
        const miaDeal = newDeal({
          details: {
            ukefDealId: 'test-1',
          },
        });

        const minDeal = newDeal({
          details: {
            ukefDealId: 'test-2',
          },
        });

        const submittedDeals = await createAndSubmitDeals([
          miaDeal,
          minDeal,
        ]);

        const mockReqBody = {
          queryParams: {
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

      it('returns deals filtered by details.owningBank.name', async () => {
        const miaDeal = newDeal({
          details: {
            owningBank: {
              name: 'My Bank',
            },
          },
        });

        const miaDeal2 = newDeal({
          details: {
            owningBank: {
              name: 'My Bank',
            },
          },
        });

        const minDeal = newDeal({
          details: {
            owningBank: {
              name: 'Another Bank',
            },
          },
        });

        const submittedDeals = await createAndSubmitDeals([
          miaDeal,
          miaDeal2,
          minDeal,
        ]);

        const mockReqBody = {
          queryParams: {
            searchString: miaDeal.details.owningBank.name,
          },
        };

        const { status, body } = await api.get('/v1/tfm/deals', mockReqBody);

        expect(status).toEqual(200);

        const expectedDeals = submittedDeals.filter((deal) =>
          deal.dealSnapshot.details.owningBank.name === miaDeal.details.owningBank.name);

        expect(body.deals.length).toEqual(expectedDeals.length);

        expect(body.deals).toEqual(expectedDeals);
      });

      it('returns deals filtered by submissionDetails.supplier-name', async () => {
        const miaDeal = newDeal({
          submissionDetails: {
            'supplier-name': 'Test Supplier Name',
          },
        });

        const minDeal = newDeal({});

        const submittedDeals = await createAndSubmitDeals([
          miaDeal,
          minDeal,
        ]);

        const mockReqBody = {
          queryParams: {
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
          details: {
            submissionType: 'Automatic Inclusion Notice',
          },
        });

        const miaDeal = newDeal({
          details: {
            submissionType: 'Manual Inclusion Application',
          },
        });

        const minDeal = newDeal({
          details: {
            submissionType: 'Manual Inclusion Notice',
          },
        });

        const submittedDeals = await createAndSubmitDeals([
          ainDeal,
          miaDeal,
          minDeal,
        ]);

        const mockReqBody = {
          queryParams: {
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

      it('returns deals filtered by submissionDetails.buyer-name', async () => {
        const ainDeal = newDeal({
          submissionDetails: {
            'buyer-name': 'Buyer A',
          },
        });

        const miaDeal = newDeal({
          submissionDetails: {
            'buyer-name': 'Buyer B',
          },
        });

        const submittedDeals = await createAndSubmitDeals([
          ainDeal,
          miaDeal,
        ]);

        const mockReqBody = {
          queryParams: {
            searchString: ainDeal.submissionDetails['buyer-name'],
          },
        };

        const { status, body } = await api.get('/v1/tfm/deals', mockReqBody);

        expect(status).toEqual(200);

        const expectedDeals = submittedDeals.filter((deal) =>
          deal.dealSnapshot.submissionDetails['buyer-name'] === ainDeal.submissionDetails['buyer-name']);

        expect(body.deals.length).toEqual(expectedDeals.length);

        expect(body.deals).toEqual(expectedDeals);
      });

      it('returns deals filtered by tfm stage', async () => {
        // NOTE: tfm.stage is generated on deal submission.

        const ainDealWithConfirmedStage = newDeal({
          details: {
            ukefDealId: 'DEAL-WITH-CONFIRMED-STAGE',
            status: 'Submitted',
          },
        });

        const miaDealWithApplicationStage = newDeal({
          details: {
            ukefDealId: 'DEAL-WITH-APPLICATION-STAGE',
            status: 'Submitted',
            submissionType: 'Manual Inclusion Application',
          },
        });

        const submittedDeals = await createAndSubmitDeals([
          ainDealWithConfirmedStage,
          miaDealWithApplicationStage,
        ]);

        const mockReqBody = {
          queryParams: {
            searchString: 'Confirmed',
          },
        };

        const { status, body } = await api.get('/v1/tfm/deals', mockReqBody);

        expect(status).toEqual(200);

        const expectedDeals = submittedDeals.filter((deal) =>
          deal.dealSnapshot.details.ukefDealId === ainDealWithConfirmedStage.details.ukefDealId);

        expect(body.deals.length).toEqual(expectedDeals.length);

        expect(body.deals).toEqual(expectedDeals);
      });

      describe('deals filtered by tfm.product', () => {
        let submittedDeals;

        const dealWithBonds = newDeal({
          details: {
            ukefDealId: 'DEAL-WITH-BONDS',
            submissionType: 'Automatic Inclusion Notice',
          },
          bondTransactions: {
            items: [
              { _id: '1', facilityType: 'bond' },
            ],
          },
        });

        const dealWithLoans = newDeal({
          details: {
            ukefDealId: 'DEAL-WITH-LOANS',
            submissionType: 'Manual Inclusion Application',
          },
          loanTransactions: {
            items: [
              { _id: '1', facilityType: 'loan' },
            ],
          },
        });

        beforeEach(async () => {
          submittedDeals = await createAndSubmitDeals([
            dealWithBonds,
            dealWithLoans,
          ]);
        });

        it('returns deals filtered by bond productCode', async () => {
          const mockReqBody = {
            queryParams: {
              searchString: 'BSS',
            },
          };

          const { status, body } = await api.get('/v1/tfm/deals', mockReqBody);

          expect(status).toEqual(200);

          const expectedDeals = submittedDeals.filter((deal) =>
            deal.dealSnapshot.ukefDealId === 'DEAL-WITH-BONDS');

          expect(body.deals.length).toEqual(expectedDeals.length);

          expect(body.deals).toEqual(expectedDeals);
        });

        it('returns deals filtered by loan productCode', async () => {
          const mockReqBody = {
            queryParams: {
              searchString: 'EWCS',
            },
          };

          const { status, body } = await api.get('/v1/tfm/deals', mockReqBody);

          expect(status).toEqual(200);

          const expectedDeals = submittedDeals.filter((deal) =>
            deal.dealSnapshot.ukefDealId === 'DEAL-WITH-LOANS');

          expect(body.deals.length).toEqual(expectedDeals.length);

          expect(body.deals).toEqual(expectedDeals);
        });

        it('returns deals filtered by bond and loan productCode', async () => {
          const dealWithBondsAndLoans = newDeal({
            details: {
              ukefDealId: 'DEAL-WITH-BONDS-AND-LOANS',
              submissionType: 'Manual Inclusion Application',
            },
            loanTransactions: {
              items: [
                { _id: '1', facilityType: 'loan' },
              ],
            },
          });

          submittedDeals = await createAndSubmitDeals([
            dealWithBonds,
            dealWithLoans,
            dealWithBondsAndLoans,
          ]);

          const mockReqBody = {
            queryParams: {
              searchString: 'BSS & EWCS',
            },
          };

          const { status, body } = await api.get('/v1/tfm/deals', mockReqBody);

          expect(status).toEqual(200);

          const expectedDeals = submittedDeals.filter((deal) =>
            deal.dealSnapshot.ukefDealId === 'DEAL-WITH-BONDS-AND-LOANS');

          expect(body.deals.length).toEqual(expectedDeals.length);

          expect(body.deals).toEqual(expectedDeals);
        });
      });

      it('returns deals filtered by tfm.dateReceived in dd-MM-yyyy format', async () => {
        const today = new Date();
        const todayTimestamp = new Date().valueOf().toString();
        const yesterday = sub(today, { days: 1 });

        const dealSubmittedYesterday = newDeal({
          details: {
            ukefDealId: 'DEAL-SUBMITTED-YESTERDAY',
            status: 'Submitted',
            submissionDate: yesterday,
          },
        });

        const dealSubmittedToday = newDeal({
          details: {
            ukefDealId: 'DEAL-SUBMITTED-TODAY',
            status: 'Submitted',
            submissionDate: todayTimestamp,
          },
        });

        const submittedDeals = await createAndSubmitDeals([
          dealSubmittedYesterday,
          dealSubmittedToday,
        ]);

        const dealSubmittedYesterdayResponseBody = submittedDeals.find((deal) =>
          deal.dealSnapshot.details.ukefDealId === dealSubmittedYesterday.details.ukefDealId);

        const dealSubmittedTodayResponseBody = submittedDeals.find((deal) =>
          deal.dealSnapshot.details.ukefDealId === dealSubmittedToday.details.ukefDealId);

        const yesterdayFormatted = format(yesterday, 'dd-MM-yyyy');
        const todayFormatted = format(today, 'dd-MM-yyyy');

        // manually update deal's tfm object for test
        const dealSubmittedYesterdayUpdateResponse = await api.put({
          dealUpdate: {
            tfm: {
              dateReceived: yesterdayFormatted,
            },
          },
        }).to(`/v1/tfm/deals/${dealSubmittedYesterdayResponseBody._id}`);

        await api.put({
          dealUpdate: {
            tfm: {
              dateReceived: todayFormatted,
            },
          },
        }).to(`/v1/tfm/deals/${dealSubmittedTodayResponseBody._id}`);

        const mockReqBody = {
          queryParams: {
            searchString: String(yesterdayFormatted),
          },
        };

        const { status, body } = await api.get('/v1/tfm/deals', mockReqBody);

        expect(status).toEqual(200);

        const expectedDeals = [
          dealSubmittedYesterdayUpdateResponse.body,
        ];

        expect(body.deals.length).toEqual(expectedDeals.length);

        expect(body.deals).toEqual(expectedDeals);
      });

      it('returns deals filtered by tfm.dateReceived in dd/MM/yyyy format', async () => {
        const today = new Date();
        const todayTimestamp = new Date().valueOf().toString();
        const yesterday = sub(today, { days: 1 });
        const yesterdayTimestamp = sub(today, { days: 1 }).valueOf().toString();

        const dealSubmittedYesterday = newDeal({
          details: {
            ukefDealId: 'DEAL-SUBMITTED-YESTERDAY',
            status: 'Submitted',
            submissionDate: yesterdayTimestamp,
          },
        });

        const dealSubmittedToday = newDeal({
          details: {
            ukefDealId: 'DEAL-SUBMITTED-TODAY',
            status: 'Submitted',
            submissionDate: todayTimestamp,
          },
        });

        const submittedDeals = await createAndSubmitDeals([
          dealSubmittedYesterday,
          dealSubmittedToday,
        ]);

        const dealSubmittedYesterdayResponseBody = submittedDeals.find((deal) =>
          deal.dealSnapshot.details.ukefDealId === dealSubmittedYesterday.details.ukefDealId);

        const dealSubmittedTodayResponseBody = submittedDeals.find((deal) =>
          deal.dealSnapshot.details.ukefDealId === dealSubmittedToday.details.ukefDealId);

        const yesterdayFormatted = format(yesterday, 'dd-MM-yyyy');
        const todayFormatted = format(today, 'dd-MM-yyyy');

        // manually update deal's tfm object for test
        const dealSubmittedYesterdayUpdateResponse = await api.put({
          dealUpdate: {
            tfm: {
              dateReceived: yesterdayFormatted,
            },
          },
        }).to(`/v1/tfm/deals/${dealSubmittedYesterdayResponseBody._id}`);

        await api.put({
          dealUpdate: {
            tfm: {
              dateReceived: todayFormatted,
            },
          },
        }).to(`/v1/tfm/deals/${dealSubmittedTodayResponseBody._id}`);

        const mockReqBody = {
          queryParams: {
            searchString: String(format(yesterday, 'dd/MM/yyyy')),
          },
        };

        const { status, body } = await api.get('/v1/tfm/deals', mockReqBody);

        expect(status).toEqual(200);

        const expectedDeals = [
          dealSubmittedYesterdayUpdateResponse.body,
        ];

        expect(body.deals.length).toEqual(expectedDeals.length);

        expect(body.deals).toEqual(expectedDeals);
      });
    });
  });
});
