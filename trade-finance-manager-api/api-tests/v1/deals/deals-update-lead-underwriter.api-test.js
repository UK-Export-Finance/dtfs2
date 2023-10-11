const app = require('../../../src/createApp');
const { as } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const api = require('../../../src/v1/api');
const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');
const MOCK_USERS = require('../../../src/v1/__mocks__/mock-users');
const { mockUpdateDeal, mockFindOneDeal, mockFindUserById, mockUpdateDealFailureWith500Status } = require('../../../src/v1/__mocks__/common-api-mocks');

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

  beforeEach(() => {
    api.updateDeal.mockReset();
    api.findOneDeal.mockReset();
    api.findUserById.mockReset();
  });

  it('should return  updated leadUnderwriter', async () => {
    mockUpdateDeal(MOCK_DEAL);
    mockFindOneDeal(MOCK_DEAL);
    mockFindUserById();

    const { status, body } = await as(tokenUser).put(VALID_LEAD_UNDERWRITER_UPDATE).to(`/v1/deals/${VALID_DEAL_ID}/underwriting/lead-underwriter`);

    expect(status).toBe(200);
    expect(body).toEqual({
      leadUnderwriter: VALID_USER_ID,
    });
  });

  it('should return a 400 if deal id is invalid', async () => {
    mockUpdateDeal(MOCK_DEAL);
    mockFindOneDeal(MOCK_DEAL);
    mockFindUserById();

    const { status, body } = await as(tokenUser).put(VALID_LEAD_UNDERWRITER_UPDATE).to(`/v1/deals/${INVALID_DEAL_ID}/underwriting/lead-underwriter`);

    expect(status).toBe(400);
    expect(body).toEqual({
      errors: [{ location: 'params', msg: 'The Deal ID (dealId) provided should be a Mongo ID', path: 'dealId', type: 'field', value: 'InvalidDealId' }],
      status: 400,
    });
  });

  it('should return a 500 if unable to update lead underwriter', async () => {
    mockUpdateDealFailureWith500Status();
    mockFindOneDeal();
    mockFindUserById();

    const { status, body } = await as(tokenUser).put(VALID_LEAD_UNDERWRITER_UPDATE).to(`/v1/deals/${VALID_DEAL_ID}/underwriting/lead-underwriter`);

    expect(status).toBe(500);
    expect(body).toEqual({ data: 'Unable to update lead underwriter' });
  });
});
