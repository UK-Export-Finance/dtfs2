const { when } = require('jest-when');

const app = require('../../../src/createApp');
const { as } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const api = require('../../../src/v1/api');
const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');
const MOCK_USERS = require('../../../src/v1/__mocks__/mock-users');
const MOCK_AIN_TASKS = require('../../../src/v1/__mocks__/mock-AIN-tasks');

const MOCK_MIA_TASKS = require('../../../src/v1/__mocks__/mock-MIA-tasks');

describe('PUT /teams/:teamId/members', () => {
  const VALID_DEAL_ID = '61f6b18502fade01b1e8f07f';
  const INVALID_DEAL_ID = 'InvalidDealId';
  const VALID_USER_ID = MOCK_USERS[0]._id;
  const VALID_LEAD_UNDERWRITER_UPDATE = {
    userId: VALID_USER_ID,
  };

  let tokenUser;

  beforeAll(async () => {
    tokenUser = await testUserCache.initialise(app);
  });

  afterAll(() => {
    api.updateDeal.mockReset();
  });

  it('should return  updated leadUnderwriter', async () => {
    mockUpdateDealSuccess();
    mockFindOneDealSuccess();
    mockFindUserByIdSuccess();
    const { status, body } = await as(tokenUser).put(VALID_LEAD_UNDERWRITER_UPDATE).to(`/v1/deals/${VALID_DEAL_ID}/underwriting/update-lead-underwriter`);
    expect(status).toBe(200);
    expect(body).toEqual({
      leadUnderwriter: VALID_USER_ID,
    });
  });

  it('should return a 400 if deal id is invalid', async () => {
    mockUpdateDealSuccess();
    mockFindOneDealSuccess();
    mockFindUserByIdSuccess();

    const { status, body } = await as(tokenUser).put(VALID_LEAD_UNDERWRITER_UPDATE).to(`/v1/deals/${INVALID_DEAL_ID}/underwriting/update-lead-underwriter`);

    expect(status).toBe(400);
    expect(body).toEqual({
      errors: [{ location: 'params', msg: 'The Deal ID (dealId) provided should be a Mongo ID', path: 'dealId', type: 'field', value: 'InvalidDealId' }],
      status: 400,
    });
  });

  it('should return a 400 if unable to update lead underwriter', async () => {
    mockUpdateDealFailureWith500Status();
    mockFindOneDealSuccess();
    mockFindUserByIdSuccess();
    const { status, body } = await as(tokenUser).put(VALID_LEAD_UNDERWRITER_UPDATE).to(`/v1/deals/${VALID_DEAL_ID}/underwriting/update-lead-underwriter`);

    expect(status).toBe(400);
    expect(body).toEqual({ data: 'Unable to update lead underwriter' });
  });

  function mockFindOneDealSuccess() {
    when(api.findOneDeal)
      .calledWith(expect.anything())
      .mockImplementation((dealId) => {
        const mockDeal = MOCK_DEAL;

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
  }

  function mockUpdateDealSuccess() {
    when(api.updateDeal)
      .calledWith(expect.anything(), expect.anything())
      .mockImplementation((dealId, updatedTfmDealData) => {
        let deal = MOCK_DEAL;

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
          }
        }

        return {
          dealSnapshot: {
            ...deal,
          },
          ...updatedTfmDealData,
        };
      });
  }

  function mockFindUserByIdSuccess() {
    api.findUserById = (userId) => MOCK_USERS.find((user) => user._id === userId);
  }

  function mockUpdateDealFailureWith500Status() {
    when(api.updateDeal).calledWith(expect.anything(), expect.anything()).mockResolvedValue({ status: 500, data: 'Error when updating deal' });
  }
});
