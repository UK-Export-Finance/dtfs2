import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { generateTfmAuditDetails, generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import * as wipeDB from '../../../wipeDB';
import { testApi } from '../../../test-api';
import { DEALS } from '../../../../src/constants';
import { MOCK_PORTAL_USER } from '../../../mocks/test-users/mock-portal-user';
import { createDeal } from '../../../helpers/create-deal';

export const newDeal = (dealOverrides) => ({
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
  dealType: 'BSS/EWCS',
  maker: {
    ...MOCK_PORTAL_USER,
    ...(dealOverrides.maker ? dealOverrides.maker : {}),
  },
  details: {
    ...dealOverrides.details,
  },
  submissionDetails: dealOverrides.submissionDetails,
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
    ...dealOverrides.eligibility,
  },
  bondTransactions: dealOverrides.bondTransactions,
  loanTransactions: dealOverrides.loanTransactions,
  ...dealOverrides,
});

export const createAndSubmitDeals = async (deals) => {
  const result = await Promise.all(
    deals.map(async (deal) => {
      // create deal
      const createResponse = await createDeal({ deal, user: deal.maker });
      expect(createResponse.status).toEqual(200);

      // submit deal
      const submitResponse = await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId: createResponse.body._id,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      expect(submitResponse.status).toEqual(200);

      return submitResponse.body;
    }),
  );

  return result;
};

export const updateDealsTfm = async (dealsTfmUpdate, sessionTfmUser) => {
  const result = await Promise.all(
    dealsTfmUpdate.map(async (deal) => {
      const updateResponse = await testApi
        .put({
          dealUpdate: {
            tfm: deal.tfm,
          },
          auditDetails: generateTfmAuditDetails(sessionTfmUser._id),
        })
        .to(`/v1/tfm/deals/${deal._id}`);

      expect(updateResponse.status).toEqual(200);
      return updateResponse.body;
    }),
  );

  return result;
};

describe('/v1/tfm/deals', () => {
  beforeEach(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.TFM_DEALS, MONGO_DB_COLLECTIONS.TFM_FACILITIES]);
  });

  describe('GET /v1/tfm/deals', () => {
    describe('returns all deals', () => {
      const miaDeal = newDeal({
        submissionType: 'Manual Inclusion Application',
      });

      const minDeal = newDeal({
        submissionType: 'Manual Inclusion Notice',
      });

      const ainDeal = newDeal({
        submissionType: 'Automatic Inclusion Notice',
      });

      beforeEach(async () => {
        await createAndSubmitDeals([miaDeal, minDeal, minDeal, ainDeal, ainDeal]);
      });

      it('without pagination', async () => {
        const { status, body } = await testApi.get('/v1/tfm/deals');

        expect(status).toEqual(200);
        const expectedTotalDeals = 5;
        expect(body.deals.length).toEqual(expectedTotalDeals);
        expect(body.pagination.totalItems).toEqual(expectedTotalDeals);
        expect(body.pagination.currentPage).toEqual(0);
        expect(body.pagination.totalPages).toEqual(1);
      });

      it('with pagination', async () => {
        const pagesize = 4;

        const urlWithPagination = (page) => `/v1/tfm/deals?&pagesize=${pagesize}&page=${page}`;

        const queryParams = { page: 0, pagesize };
        const { status: page1Status, body: page1Body } = await testApi.get(urlWithPagination(0));

        const expectedTotalDeals = 5;

        expect(page1Status).toEqual(200);
        expect(page1Body.deals.length).toEqual(4);
        expect(page1Body.pagination.totalItems).toEqual(expectedTotalDeals);
        expect(page1Body.pagination.currentPage).toEqual(0);
        expect(page1Body.pagination.totalPages).toEqual(2);

        queryParams.page = 1;
        const { status: page2Status, body: page2Body } = await testApi.get(urlWithPagination(1));

        expect(page2Status).toEqual(200);
        expect(page2Body.deals.length).toEqual(1);
        expect(page2Body.pagination.totalItems).toEqual(expectedTotalDeals);
        expect(page2Body.pagination.currentPage).toEqual(1);
        expect(page2Body.pagination.totalPages).toEqual(2);
      });
    });
  });
});
