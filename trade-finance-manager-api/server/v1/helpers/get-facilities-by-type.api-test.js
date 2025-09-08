const { FACILITY_TYPE } = require('@ukef/dtfs2-common');
const getFacilitiesByType = require('./get-facilities-by-type');

describe('get-facilities-by-type', () => {
  it('should return an array for each facility type', () => {
    const mockBonds = [{ type: FACILITY_TYPE.BOND }, { type: FACILITY_TYPE.BOND }];

    const mockLoans = [{ type: FACILITY_TYPE.LOAN }, { type: FACILITY_TYPE.LOAN }];

    const mockCashes = [{ type: FACILITY_TYPE.CASH }, { type: FACILITY_TYPE.CASH }];

    const mockContingents = [{ type: FACILITY_TYPE.CONTINGENT }, { type: FACILITY_TYPE.CONTINGENT }];

    const mockFacilities = [...mockBonds, ...mockLoans, ...mockCashes, ...mockContingents];

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
