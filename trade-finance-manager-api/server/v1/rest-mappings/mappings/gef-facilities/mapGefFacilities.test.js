const mapGefFacilities = require('./mapGefFacilities');
const facilityMapper = require('../../facility');
const MOCK_CASH_CONTINGENT_FACILITIES = require('../../../__mocks__/mock-cash-contingent-facilities');

describe('mapGefFacilities', () => {
  it('should return mapped GEF facilities', () => {
    const mockDealSnapshot = {
      facilities: [
        {
          facilitySnapshot: MOCK_CASH_CONTINGENT_FACILITIES[0],
          tfm: {},
        },
        {
          facilitySnapshot: MOCK_CASH_CONTINGENT_FACILITIES[0],
          tfm: {},
        },
      ],
    };

    const mockDealTfm = {};

    const result = mapGefFacilities(mockDealSnapshot, mockDealTfm);

    const expected = [
      facilityMapper(mockDealSnapshot.facilities[0], mockDealSnapshot, mockDealTfm),
      facilityMapper(mockDealSnapshot.facilities[1], mockDealSnapshot, mockDealTfm),
    ];

    expect(result).toEqual(expected);
  });
});
