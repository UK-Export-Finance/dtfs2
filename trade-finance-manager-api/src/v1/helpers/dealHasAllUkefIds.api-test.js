const dealHasAllUkefIds = require('./dealHasAllUkefIds');
const MOCK_DEAL_NO_UKEF_ID = require('../__mocks__/mock-deal-no-ukef-id');
const MOCK_DEAL = require('../__mocks__/mock-deal');

describe('dealHasAllUkefIds()', () => {
  it('should return FALSE when deal has no UKEF ID', async () => {
    const mockDeal = {
      ...MOCK_DEAL_NO_UKEF_ID,
      faclities: [
        {
          ukefFacilityId: '123',
        },
      ],
    };

    const result = await dealHasAllUkefIds(mockDeal._id);
    expect(result).toEqual(false);
  });

  it('should return FALSE when a facility has no UKEF ID', async () => {
    const mockDeal = {
      ...MOCK_DEAL_NO_UKEF_ID,
      ukefDealId: '123',
    };

    const result = await dealHasAllUkefIds(mockDeal._id);
    expect(result).toEqual(false);
  });

  it('should return true when a deal and facilities have UKEF ID', async () => {
    const mockDeal = MOCK_DEAL;

    const result = await dealHasAllUkefIds(mockDeal._id);
    expect(result).toEqual(true);
  });
});
