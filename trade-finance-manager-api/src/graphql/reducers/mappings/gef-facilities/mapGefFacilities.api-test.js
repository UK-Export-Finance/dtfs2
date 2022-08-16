const mapGefFacilities = require('./mapGefFacilities');
const mapGefFacility = require('./mapGefFacility');
const MOCK_CASH_CONTINGENT_FACILIIES = require('../../../../v1/__mocks__/mock-cash-contingent-facilities');

describe('mapGefFacilities', () => {
  it('should return mapped GEF facilities', () => {
    const mockDealSnapshot = {
      facilities: [
        {
          facilitySnapshot: MOCK_CASH_CONTINGENT_FACILIIES[0],
          tfm: {},
        },
        {
          facilitySnapshot: MOCK_CASH_CONTINGENT_FACILIIES[0],
          tfm: {},
        },
      ],
    };

    const mockDealTfm = {};

    const result = mapGefFacilities(mockDealSnapshot, mockDealTfm);

    const expected = [
      mapGefFacility(mockDealSnapshot.facilities[0], mockDealSnapshot, mockDealTfm),
      mapGefFacility(mockDealSnapshot.facilities[1], mockDealSnapshot, mockDealTfm),
    ];

    expect(result).toEqual(expected);
  });
});
