const getFacilitiesByType = require('./get-facilities-by-type');
const CONSTANTS = require('../../constants');

describe('get-facilities-by-type', () => {
  it('should return an array for each facility type', () => {
    const mockBonds = [
      { type: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND },
      { type: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND },
    ];

    const mockLoans = [
      { type: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN },
      { type: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN },
    ];

    const mockCashes = [
      { type: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH },
      { type: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH },
    ];

    const mockContingents = [
      { type: CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT },
      { type: CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT },
    ];

    const mockFacilities = [
      ...mockBonds,
      ...mockLoans,
      ...mockCashes,
      ...mockContingents,
    ];

    const result = getFacilitiesByType(mockFacilities);

    const expected = {
      bonds: mockBonds,
      loans: mockLoans,
      cashes: mockCashes,
      contingents: mockContingents,
    };

    expect(result).toEqual(expected);
  });
});
