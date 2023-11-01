const { when } = require('jest-when');
const MOCK_MIA_TASKS = require('../mock-MIA-tasks');
const MOCK_USERS = require('../mock-users');

const MOCK_AIN_TASKS = require('../mock-AIN-tasks');

const api = require('../../api');
const ALL_MOCK_DEALS = require('../mock-deals');
const { mockFindOneTeam } = require('./find-one-team');

/*
 * This file contains common mocks for the api (api.js). We should look to replace common mocks in api.js with jest.fn() and add implementation here.
 */

module.exports = {
  mockFindOneDeal: (mockDealToReturn = undefined) => {
    when(api.findOneDeal)
      .calledWith(expect.anything())
      .mockImplementation((dealId) => {
        const mockDeal = mockDealToReturn || ALL_MOCK_DEALS.find((d) => d._id === dealId);

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

        if (deal.dealSnapshot && deal.dealSnapshot._id === 'MOCK_MIA_SECOND_SUBMIT') {
          if (deal.dealSnapshot.submissionType === 'Manual Inclusion Application' && deal.dealSnapshot.details.submissionCount === 2) {
            deal.tfm.underwriterManagersDecision = {
              decision: 'Approved (without conditions)',
            };

            deal.tfm.tasks = MOCK_MIA_TASKS;
          }
        }

        if (deal.dealSnapshot && deal.dealSnapshot._id === 'MOCK_GEF_DEAL_SECOND_SUBMIT_MIA') {
          if (deal.dealSnapshot.submissionType === 'Manual Inclusion Application' && deal.dealSnapshot.submissionCount === 2) {
            deal.tfm.underwriterManagersDecision = {
              decision: 'Approved (without conditions)',
            };

            deal.tfm.tasks = MOCK_MIA_TASKS;
          }
        }

        if (deal.dealSnapshot && deal.dealSnapshot._id === 'MOCK_MIA_SUBMITTED') {
          if (deal.tfm && !deal.tfm.tasks) {
            deal.tfm.tasks = MOCK_MIA_TASKS;
          }
        }

        return mockDeal ? Promise.resolve(deal) : Promise.reject();
      });
  },

  mockFindOneDealFailure: () => {
    when(api.findOneDeal).calledWith(expect.anything()).mockResolvedValue(false);
  },

  mockUpdateDeal: (mockDealToReturn = undefined) => {
    api.updateDeal.mockImplementation((dealId, updatedTfmDealData) => {
      let deal = mockDealToReturn || ALL_MOCK_DEALS.find((d) => d._id === dealId);

      // if stage is updated, add to the mock deal.
      if (updatedTfmDealData.tfm) {
        if (updatedTfmDealData.tfm.stage) {
          deal = {
            ...deal,
            tfm: {
              ...updatedTfmDealData.tfm,
              tasks: updatedTfmDealData.tfm.tasks,
            },
          };
          if (!mockDealToReturn) {
            const dealIndex = ALL_MOCK_DEALS.findIndex((d) => d._id === dealId);
            ALL_MOCK_DEALS[dealIndex] = deal;
          }
        }
      }

      return {
        dealSnapshot: {
          ...deal,
        },
        ...updatedTfmDealData,
      };
    });
  },

  mockFindUserById: (userIdCalledWith = undefined, user = undefined) => {
    const toBeCalledWith = userIdCalledWith || expect.anything();

    when(api.findUserById)
      .calledWith(toBeCalledWith)
      .mockImplementation((userId) => {
        if (user) {
          return user;
        }
        return MOCK_USERS.find((u) => u._id === userId);
      });
  },
  mockFindOneTeam,
};
