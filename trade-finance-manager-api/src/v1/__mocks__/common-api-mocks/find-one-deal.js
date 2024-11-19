import ALL_MOCK_DEALS from '../mock-deals';

const { when } = require('jest-when');
const MOCK_MIA_TASKS = require('../mock-MIA-tasks');
const MOCK_AIN_TASKS = require('../mock-AIN-tasks');

const api = require('../../api').default;

export const mockFindOneDeal = (mockDealToReturn = undefined) => {
  when(api.findOneDeal)
    .calledWith(expect.anything())
    .mockImplementation((dealId) => {
      const mockDeal = mockDealToReturn || ALL_MOCK_DEALS.find((d) => d._id === dealId);
      if (!mockDeal) {
        return Promise.reject();
      }

      let tfmStage;
      let tfmProduct;

      if (mockDeal?.tfm?.stage) {
        tfmStage = mockDeal.tfm.stage;
      }

      if (mockDeal?.tfm?.product) {
        tfmProduct = mockDeal.tfm.product;
      }

      const deal = {
        _id: dealId,
        dealSnapshot: mockDeal,
        tfm: {
          tasks: MOCK_AIN_TASKS,
          exporterCreditRating: 'Good (BB-)',
          supplyContractValueInGBP: '7287.56740999854',
          parties: {
            exporter: {
              partyUrn: '1111',
            },
          },
          bondIssuerPartyUrn: '',
          bondBeneficiaryPartyUrn: '',
          stage: tfmStage,
          product: tfmProduct,
        },
      };

      if (deal.dealSnapshot?._id === 'MOCK_MIA_SECOND_SUBMIT') {
        if (deal.dealSnapshot.submissionType === 'Manual Inclusion Application' && deal.dealSnapshot.details?.submissionCount === 2) {
          deal.tfm.underwriterManagersDecision = {
            decision: 'Approved (without conditions)',
          };

          deal.tfm.tasks = MOCK_MIA_TASKS;
        }
      }

      if (deal.dealSnapshot?._id === 'MOCK_GEF_DEAL_SECOND_SUBMIT_MIA') {
        if (deal.dealSnapshot.submissionType === 'Manual Inclusion Application' && deal.dealSnapshot.submissionCount === 2) {
          deal.tfm.underwriterManagersDecision = {
            decision: 'Approved (without conditions)',
          };

          deal.tfm.tasks = MOCK_MIA_TASKS;
        }
      }

      if (deal.dealSnapshot?._id === 'MOCK_MIA_SUBMITTED') {
        if (deal.tfm && !deal.tfm.tasks) {
          deal.tfm.tasks = MOCK_MIA_TASKS;
        }
      }

      return Promise.resolve(deal);
    });
};
