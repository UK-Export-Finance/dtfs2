const app = require('../../../src/createApp');
const { as } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const api = require('../../../src/v1/api');
const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal-MIA-submitted');
const MOCK_USERS = require('../../../src/v1/__mocks__/mock-users');

describe('PUT /teams/:teamId/members', () => {
  const VALID_DEAL_ID = MOCK_DEAL._id;
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

  it('should call updateDeal with the correct params', async () => {
    await as(tokenUser).put(VALID_LEAD_UNDERWRITER_UPDATE).to(`/v1/deals/${VALID_DEAL_ID}/underwriter/update-lead-underwriter`);

    expect(api.updateDeal).toHaveBeenCalledWith(VALID_DEAL_ID, { tfm: { leadUnderwriter: VALID_USER_ID } });
  });

  it('should return updated leadUnderwriter', async () => {
    const { status, body } = await as(tokenUser).put(VALID_LEAD_UNDERWRITER_UPDATE).to(`/v1/deals/${VALID_DEAL_ID}/underwriter/update-lead-underwriter`);

    expect(status).toBe(200);
    expect(body).toEqual({
      leadUnderwriter: VALID_USER_ID,
    });
  });
  it('should return a 400 if unable to update lead underwriter', async () => {
    const { status, body } = await as(tokenUser).put(VALID_LEAD_UNDERWRITER_UPDATE).to(`/v1/deals/${INVALID_DEAL_ID}/underwriter/update-lead-underwriter`);

    expect(status).toBe(400);
    expect(body).toEqual({ data: 'Unable to update lead underwriter' });
  });
});
