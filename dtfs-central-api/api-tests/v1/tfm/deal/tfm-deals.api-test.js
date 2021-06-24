const moment = require('moment');
const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const now = require('../../../../src/now');

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
    ...dealOverrides.details,
    maker: {
      ...mockUser,
      ...(dealOverrides.details && dealOverrides.details.maker) ? dealOverrides.details.maker : {},
    },
  },
  submissionDetails: dealOverrides.submissionDetails,
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{ }],
  },
  bondTransactions: dealOverrides.bondTransactions,
  loanTransactions: dealOverrides.loanTransactions,
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
        details: {
          submissionType: 'Manual Inclusion Application',
        },
      });

      const minDeal = newDeal({
        details: {
          submissionType: 'Manual Inclusion Notice',
        },
      });

      const ainDeal = newDeal({
        details: {
          submissionType: 'Automatic Inclusion Notice',
        },
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

      it('returns deals filtered by tfm.dateReceived in DD-MM-YYYY format', async () => {
        const yesterday = moment().subtract(1, 'day');
        const yesterdayTimestamp = moment(yesterday).utc().valueOf().toString();

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
            submissionDate: now(),
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

        const yesterdayFormatted = moment(yesterday).format('DD-MM-YYYY');
        const todayFormatted = moment().format('DD-MM-YYYY');

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

      it('returns deals filtered by tfm.dateReceived in DD/MM/YYYY format', async () => {
        const yesterday = moment().subtract(1, 'day');
        const yesterdayTimestamp = moment(yesterday).utc().valueOf().toString();

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
            submissionDate: now(),
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

        const yesterdayFormatted = moment(yesterday).format('DD-MM-YYYY');
        const todayFormatted = moment().format('DD-MM-YYYY');

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
            searchString: String(moment(yesterday).format('DD/MM/YYYY')),
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
