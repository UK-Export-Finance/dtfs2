const getFacilitiesByType = require('./get-facilities-by-type');
const CONSTANTS = require('../../constants');

describe('get-facilities-by-type', () => {
  it('should return an array for each facility type', () => {
    const mockBonds = [
      { _id: 1, type: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND },
      { _id: 2, type: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND },
    ];

    const mockLoans = [
      { _id: 3, type: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN },
      { _id: 4, type: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN },
    ];

    const mockCashes = [
      { _id: 5, type: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH },
      { _id: 6, type: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH },
    ];

    const mockContingents = [
      { _id: 5, type: CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT },
      { _id: 6, type: CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT },
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
