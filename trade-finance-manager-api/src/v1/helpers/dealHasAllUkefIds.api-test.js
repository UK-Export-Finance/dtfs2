const dealHasAllUkefIds = require('./dealHasAllUkefIds');
const MOCK_DEAL_NO_UKEF_ID = require('../__mocks__/mock-deal-no-ukef-id');
const MOCK_DEAL = require('../__mocks__/mock-deal');
const MOCK_DEAL_GEF = require('../__mocks__/mock-gef-deal');

describe('dealHasAllUkefIds()', () => {
  it('Should return FALSE when deal has no UKEF ID', async () => {
    const mockDeal = {
      ...MOCK_DEAL_NO_UKEF_ID,
      facilities: [
        {
          ukefFacilityId: '123',
        },
      ],
    };

    const result = await dealHasAllUkefIds(mockDeal._id);
    expect(result.status).toEqual(false);
  });

  it('Should return FALSE when a facility has no UKEF ID', async () => {
    const mockDeal = {
      ...MOCK_DEAL_NO_UKEF_ID,
      ukefDealId: '123',
    };

    const result = await dealHasAllUkefIds(mockDeal._id);
    expect(result.status).toEqual(false);
  });

  it('Should return TRUE when a deal and facilities have UKEF IDs', async () => {
    const mockDeal = MOCK_DEAL;

    const result = await dealHasAllUkefIds(mockDeal._id);
    expect(result.status).toEqual(true);
  });

  it('Should return TRUE when a deal and facilities have UKEF IDs - BSS/EWCS', async () => {
    const mockDeal = MOCK_DEAL;

    const result = await dealHasAllUkefIds(mockDeal._id);
    expect(result.status).toEqual(true);
  });

  it('Should return TRUE when a deal and facilities have UKEF IDs - GEF', async () => {
    const mockDeal = {
      ...MOCK_DEAL_GEF,
      facilities: [
        {
          ukefFacilityId: '123',
        },
        {
          ukefFacilityId: '123',
        },
        {
          ukefFacilityId: '123',
        },
      ],
    };

    const result = await dealHasAllUkefIds(mockDeal._id);
    expect(result.status).toEqual(true);
  });

  it('Should treat migrated deal as a normal deal with pre-generated UKEF IDs', async () => {
    const deal = MOCK_DEAL_GEF;
    deal.dataMigration = { drupalDealId: '1234' };
    const mockDeal = {
      ...deal,
      facilities: [
        {
          ukefFacilityId: '123',
        },
        {
          ukefFacilityId: '123',
        },
        {
          ukefFacilityId: '123',
        },
      ],
    };

    const result = await dealHasAllUkefIds(mockDeal._id);
    expect(result.status).toEqual(true);
  });
});
