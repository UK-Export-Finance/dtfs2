const mapGefFacilities = require('./mapGefFacilities');
const mapGefFacility = require('./mapGefFacility');

const MOCK_GEF_DEAL = require('../../../../v1/__mocks__/mock-gef-deal');

describe('mapGefFacilities', () => {
  it('should return mapped GEF facilities', () => {
    const mockDealSnapshot = {
      facilities: [
        {
          facilitySnapshot: MOCK_GEF_DEAL.facilities[0],
          tfm: {},
        },
        {
          facilitySnapshot: MOCK_GEF_DEAL.facilities[0],
          tfm: {},
        },
      ],
    };

    const result = mapGefFacilities(mockDealSnapshot);

    const expected = [
      mapGefFacility(mockDealSnapshot.facilities[0], mockDealSnapshot),
      mapGefFacility(mockDealSnapshot.facilities[1], mockDealSnapshot),
    ];

    expect(result).toEqual(expected);
  });
});
