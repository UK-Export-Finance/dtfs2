const mapBssEwcsFacility = require('./map-bss-ewcs-facility');

describe('mappings - map submitted deal - mapSubmittedDeal', () => {
  it('should return mapped facility', () => {
    const mockFacility = {
      requestedCoverStartDate: 12345678,
      tfm: {},
    };

    const result = mapBssEwcsFacility(mockFacility);

    const expected = {
      ...mockFacility,
      coverStartDate: mockFacility.requestedCoverStartDate,
    };

    expect(result).toEqual(expected);
  });
});
