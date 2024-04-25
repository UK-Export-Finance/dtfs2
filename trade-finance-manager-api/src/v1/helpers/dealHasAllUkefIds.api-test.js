const { dealHasAllUkefIds, dealHasAllValidUkefIds } = require('./dealHasAllUkefIds');
const MOCK_DEAL_NO_UKEF_ID = require('../__mocks__/mock-deal-no-ukef-id');
const MOCK_DEAL = require('../__mocks__/mock-deal');
const MOCK_DEAL_GEF = require('../__mocks__/mock-gef-deal');
const api = require('../api');
const { mockFindOneDeal } = require('../__mocks__/common-api-mocks');

describe('dealHasAllUkefIds()', () => {
  beforeEach(() => {
    api.findOneDeal.mockReset();
    mockFindOneDeal();
  });

  it('Should return FALSE when deal has no UKEF ID', async () => {
    const mockDeal = {
      ...MOCK_DEAL_NO_UKEF_ID,
      facilities: [
        {
          ukefFacilityId: '1234567890',
        },
      ],
    };

    const result = await dealHasAllUkefIds(mockDeal._id);
    expect(result.status).toEqual(false);
  });

  it('Should return FALSE when a facility has no UKEF ID', async () => {
    const mockDeal = {
      ...MOCK_DEAL_NO_UKEF_ID,
      ukefDealId: '1234567890',
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
          ukefFacilityId: '1234567890',
        },
        {
          ukefFacilityId: '1234567890',
        },
        {
          ukefFacilityId: '1234567890',
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
          ukefFacilityId: '1234567890',
        },
        {
          ukefFacilityId: '1234567890',
        },
        {
          ukefFacilityId: '1234567890',
        },
      ],
    };

    const result = await dealHasAllUkefIds(mockDeal._id);
    expect(result.status).toEqual(true);
  });
});

describe('dealHasAllValidUkefIds function', () => {
  beforeEach(() => {
    api.findOneDeal.mockReset();
    mockFindOneDeal();
  });

  // Tests that the function returns false if deal not found
  it('should test deal not found', async () => {
    const result = await dealHasAllValidUkefIds('invalid deal id');
    expect(result.status).toBe(false);
    expect(result.message).toBe('TFM Deal not found');
  });

  // Tests that the function returns false if dealSnapshot or facilities are missing
  it('should test missing deal snapshot or facilities', async () => {
    const mockDeal = {
      ...MOCK_DEAL_NO_UKEF_ID,
      facilities: [
        {
          ukefFacilityId: '1234567890',
        },
      ],
    };

    const result = await dealHasAllValidUkefIds(mockDeal._id);

    expect(result.status).toBe(false);
  });

  // Tests that the function returns false if  DEAL_TYPE is not GEF and ukefDealId is missing
  it('should test missing ukef deal id', async () => {
    const result = await dealHasAllValidUkefIds(MOCK_DEAL._id);

    expect(result.status).toBe(true);
  });
});
