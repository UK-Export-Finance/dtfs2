import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { sub, format } from 'date-fns';
import * as wipeDB from '../../../wipeDB';
import { testApi } from '../../../test-api';
import { newDeal, createAndSubmitDeals } from './tfm-deals-get.api-test';
import { MOCK_TFM_USER } from '../../../mocks/test-users/mock-tfm-user';

describe('/v1/tfm/deals', () => {
  beforeEach(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.TFM_DEALS, MONGO_DB_COLLECTIONS.TFM_FACILITIES]);
  });

  describe('GET /v1/tfm/deals', () => {
    describe('filter by search string', () => {
      it('returns deals filtered by deal.details.ukefDealId (BSS/EWCS)', async () => {
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

        const submittedDeals = await createAndSubmitDeals([miaDeal, minDeal]);

        const { status, body } = await testApi.get(`/v1/tfm/deals?searchString=${miaDeal.details.ukefDealId}`);

        expect(status).toEqual(200);

        const expectedDeals = submittedDeals.filter((deal) => deal.dealSnapshot.details.ukefDealId === miaDeal.details.ukefDealId);

        expect(body.deals.length).toEqual(expectedDeals.length);

        expect(body.deals).toEqual(expectedDeals);
      });

      it('returns deals filtered by deal.ukefDealId (GEF)', async () => {
        const miaDeal = newDeal({
          ukefDealId: 'test-1',
        });

        const minDeal = newDeal({
          ukefDealId: 'test-2',
        });

        const submittedDeals = await createAndSubmitDeals([miaDeal, minDeal]);

        const { status, body } = await testApi.get(`/v1/tfm/deals?searchString=${miaDeal.ukefDealId}`);

        expect(status).toEqual(200);

        const expectedDeals = submittedDeals.filter((deal) => deal.dealSnapshot.ukefDealId === miaDeal.ukefDealId);

        expect(body.deals.length).toEqual(expectedDeals.length);

        expect(body.deals).toEqual(expectedDeals);
      });

      it('returns deals filtered by bank.name', async () => {
        const miaDeal = newDeal({
          bank: {
            name: 'My Bank',
          },
        });

        const miaDeal2 = newDeal({
          bank: {
            name: 'My Bank',
          },
        });

        const minDeal = newDeal({
          bank: {
            name: 'Another Bank',
          },
        });

        const submittedDeals = await createAndSubmitDeals([miaDeal, miaDeal2, minDeal]);

        const { status, body } = await testApi.get(`/v1/tfm/deals?searchString=${miaDeal.bank.name}`);

        expect(status).toEqual(200);

        const expectedDeals = submittedDeals.filter((deal) => deal.dealSnapshot.bank.name === miaDeal.bank.name);

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

        const submittedDeals = await createAndSubmitDeals([miaDeal, minDeal]);

        const { status, body } = await testApi.get(`/v1/tfm/deals?searchString=${miaDeal.submissionDetails['supplier-name']}`);

        expect(status).toEqual(200);

        const expectedDeals = submittedDeals.filter(
          (deal) => deal.dealSnapshot.submissionDetails['supplier-name'] === miaDeal.submissionDetails['supplier-name'],
        );

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

        const submittedDeals = await createAndSubmitDeals([ainDeal, miaDeal, minDeal]);

        const { status, body } = await testApi.get(`/v1/tfm/deals?searchString=${ainDeal.submissionType}`);

        expect(status).toEqual(200);

        const expectedDeals = submittedDeals.filter((deal) => deal.dealSnapshot.submissionType === ainDeal.submissionType);

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

        const submittedDeals = await createAndSubmitDeals([ainDeal, miaDeal]);

        const { status, body } = await testApi.get(`/v1/tfm/deals?searchString=${ainDeal.submissionDetails['buyer-name']}`);

        expect(status).toEqual(200);

        const expectedDeals = submittedDeals.filter((deal) => deal.dealSnapshot.submissionDetails['buyer-name'] === ainDeal.submissionDetails['buyer-name']);

        expect(body.deals.length).toEqual(expectedDeals.length);

        expect(body.deals).toEqual(expectedDeals);
      });

      it('returns deals filtered by tfm stage', async () => {
        // NOTE: tfm.stage is generated on deal submission.

        const ainDealWithConfirmedStage = newDeal({
          status: 'Submitted',
          details: {
            ukefDealId: 'DEAL-WITH-CONFIRMED-STAGE',
          },
        });

        const miaDealWithApplicationStage = newDeal({
          submissionType: 'Manual Inclusion Application',
          status: 'Submitted',
          details: {
            ukefDealId: 'DEAL-WITH-APPLICATION-STAGE',
          },
        });

        const submittedDeals = await createAndSubmitDeals([ainDealWithConfirmedStage, miaDealWithApplicationStage]);

        const { status, body } = await testApi.get('/v1/tfm/deals?searchString=Confirmed');

        expect(status).toEqual(200);

        const expectedDeals = submittedDeals.filter((deal) => deal.dealSnapshot.details.ukefDealId === ainDealWithConfirmedStage.details.ukefDealId);

        expect(body.deals.length).toEqual(expectedDeals.length);

        expect(body.deals).toEqual(expectedDeals);
      });

      describe('deals filtered by tfm.product', () => {
        let submittedDeals;

        const dealWithBonds = newDeal({
          submissionType: 'Automatic Inclusion Notice',
          details: {
            ukefDealId: 'DEAL-WITH-BONDS',
          },
          bondTransactions: {
            items: [{ _id: '1', type: 'Bond' }],
          },
        });

        const dealWithLoans = newDeal({
          submissionType: 'Manual Inclusion Application',
          details: {
            ukefDealId: 'DEAL-WITH-LOANS',
          },
          loanTransactions: {
            items: [{ _id: '1', type: 'Loan' }],
          },
        });

        beforeEach(async () => {
          submittedDeals = await createAndSubmitDeals([dealWithBonds, dealWithLoans]);
        });

        it('returns deals filtered by Bond productCode', async () => {
          const { status, body } = await testApi.get('/v1/tfm/deals?searchString=BSS');

          expect(status).toEqual(200);

          const expectedDeals = submittedDeals.filter((deal) => deal.dealSnapshot.ukefDealId === 'DEAL-WITH-BONDS');

          expect(body.deals.length).toEqual(expectedDeals.length);

          expect(body.deals).toEqual(expectedDeals);
        });

        it('returns deals filtered by loan productCode', async () => {
          const { status, body } = await testApi.get('/v1/tfm/deals?searchString=EWCS');

          expect(status).toEqual(200);

          const expectedDeals = submittedDeals.filter((deal) => deal.dealSnapshot.ukefDealId === 'DEAL-WITH-LOANS');

          expect(body.deals.length).toEqual(expectedDeals.length);

          expect(body.deals).toEqual(expectedDeals);
        });

        it('returns deals filtered by Bond and loan productCode', async () => {
          const dealWithBondsAndLoans = newDeal({
            submissionType: 'Manual Inclusion Application',
            details: {
              ukefDealId: 'DEAL-WITH-BONDS-AND-LOANS',
            },
            loanTransactions: {
              items: [{ _id: '1', type: 'Loan' }],
            },
          });

          submittedDeals = await createAndSubmitDeals([dealWithBonds, dealWithLoans, dealWithBondsAndLoans]);

          const { status, body } = await testApi.get('/v1/tfm/deals?searchString=BSS%20&%20EWCS');

          expect(status).toEqual(200);

          const expectedDeals = submittedDeals.filter((deal) => deal.dealSnapshot.ukefDealId === 'DEAL-WITH-BONDS-AND-LOANS');

          expect(body.deals.length).toEqual(expectedDeals.length);

          expect(body.deals).toEqual(expectedDeals);
        });
      });

      it('returns deals filtered by tfm.dateReceived in dd-MM-yyyy format', async () => {
        const today = new Date();
        const todayTimestamp = new Date().valueOf().toString();
        const yesterday = sub(today, { days: 1 });

        const dealSubmittedYesterday = newDeal({
          status: 'Submitted',
          details: {
            ukefDealId: 'DEAL-SUBMITTED_TO_UKEF-YESTERDAY',
            submissionDate: yesterday,
          },
        });

        const dealSubmittedToday = newDeal({
          status: 'Submitted',
          details: {
            ukefDealId: 'DEAL-SUBMITTED_TO_UKEF-TODAY',
            submissionDate: todayTimestamp,
          },
        });

        const submittedDeals = await createAndSubmitDeals([dealSubmittedYesterday, dealSubmittedToday]);

        const dealSubmittedYesterdayResponseBody = submittedDeals.find(
          (deal) => deal.dealSnapshot.details.ukefDealId === dealSubmittedYesterday.details.ukefDealId,
        );

        const dealSubmittedTodayResponseBody = submittedDeals.find((deal) => deal.dealSnapshot.details.ukefDealId === dealSubmittedToday.details.ukefDealId);

        const yesterdayFormatted = format(yesterday, 'dd-MM-yyyy');
        const todayFormatted = format(today, 'dd-MM-yyyy');

        // manually update deal's tfm object for test
        const dealSubmittedYesterdayUpdateResponse = await testApi
          .put({
            dealUpdate: {
              tfm: {
                dateReceived: yesterdayFormatted,
              },
            },
            auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id),
          })
          .to(`/v1/tfm/deals/${dealSubmittedYesterdayResponseBody._id}`);

        await testApi
          .put({
            dealUpdate: {
              tfm: {
                dateReceived: todayFormatted,
              },
            },
            auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id),
          })
          .to(`/v1/tfm/deals/${dealSubmittedTodayResponseBody._id}`);

        const { status, body } = await testApi.get(`/v1/tfm/deals?searchString=${String(yesterdayFormatted)}`);

        expect(status).toEqual(200);

        const expectedDeals = [dealSubmittedYesterdayUpdateResponse.body];

        expect(body.deals.length).toEqual(expectedDeals.length);

        expect(body.deals).toEqual(expectedDeals);
      });

      it('returns deals filtered by tfm.dateReceived in dd/MM/yyyy format', async () => {
        const today = new Date();
        const todayTimestamp = new Date().valueOf().toString();
        const yesterday = sub(today, { days: 1 });
        const yesterdayTimestamp = sub(today, { days: 1 }).valueOf().toString();

        const dealSubmittedYesterday = newDeal({
          status: 'Submitted',
          details: {
            ukefDealId: 'DEAL-SUBMITTED_TO_UKEF-YESTERDAY',
            submissionDate: yesterdayTimestamp,
          },
        });

        const dealSubmittedToday = newDeal({
          status: 'Submitted',
          details: {
            ukefDealId: 'DEAL-SUBMITTED_TO_UKEF-TODAY',
            submissionDate: todayTimestamp,
          },
        });

        const submittedDeals = await createAndSubmitDeals([dealSubmittedYesterday, dealSubmittedToday]);

        const dealSubmittedYesterdayResponseBody = submittedDeals.find(
          (deal) => deal.dealSnapshot.details.ukefDealId === dealSubmittedYesterday.details.ukefDealId,
        );

        const dealSubmittedTodayResponseBody = submittedDeals.find((deal) => deal.dealSnapshot.details.ukefDealId === dealSubmittedToday.details.ukefDealId);

        const yesterdayFormatted = format(yesterday, 'dd-MM-yyyy');
        const todayFormatted = format(today, 'dd-MM-yyyy');

        // manually update deal's tfm object for test
        const dealSubmittedYesterdayUpdateResponse = await testApi
          .put({
            dealUpdate: {
              tfm: {
                dateReceived: yesterdayFormatted,
              },
            },
            auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id),
          })
          .to(`/v1/tfm/deals/${dealSubmittedYesterdayResponseBody._id}`);

        await testApi
          .put({
            dealUpdate: {
              tfm: {
                dateReceived: todayFormatted,
              },
            },
            auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id),
          })
          .to(`/v1/tfm/deals/${dealSubmittedTodayResponseBody._id}`);

        const { status, body } = await testApi.get(`/v1/tfm/deals?searchString=${String(format(yesterday, 'dd/MM/yyyy'))}`);

        expect(status).toEqual(200);

        const expectedDeals = [dealSubmittedYesterdayUpdateResponse.body];

        expect(body.deals.length).toEqual(expectedDeals.length);

        expect(body.deals).toEqual(expectedDeals);
      });
    });
  });
});
