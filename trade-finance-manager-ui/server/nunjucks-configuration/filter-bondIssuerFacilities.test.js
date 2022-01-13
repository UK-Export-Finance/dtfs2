import bondIssuerFacilities from './filter-bondIssuerFacilities';
import CONSTANTS from '../constants/facility';

describe('nunjuck filters - bondIssuerFacilities', () => {
  it('should only return facilities that have `Bond` ukefFacilityType and bondIssuer', () => {
    const mockBonds = [
      {
        _id: '1',
        facilitySnapshot: {
          _id: '1',
          ukefFacilityType: CONSTANTS.FACILITY_TYPE.BOND,
          bondIssuer: 'test',
        },
      },
      {
        _id: '2',
        facilitySnapshot: {
          _id: '2',
          ukefFacilityType: CONSTANTS.FACILITY_TYPE.BOND,
          bondIssuer: 'test',
        },
      },
    ];

    const mockBondsWithoutBondIssuer = [
      {
        _id: '3',
        facilitySnapshot: {
          _id: '3',
          ukefFacilityType: CONSTANTS.FACILITY_TYPE.BOND,
        },
      },
    ];

    const mockLoans = [
      {
        _id: '10',
        facilitySnapshot: {
          _id: '10',
          ukefFacilityType: CONSTANTS.FACILITY_TYPE.LOAN,
        },
      },
      {
        _id: '10',
        facilitySnapshot: {
          _id: '10',
          ukefFacilityType: CONSTANTS.FACILITY_TYPE.LOAN,
        },
      },
    ];

    const mockFacilities = [
      ...mockBonds,
      ...mockBondsWithoutBondIssuer,
      ...mockLoans,
    ];

    const result = bondIssuerFacilities(mockFacilities);
    expect(result).toEqual(mockBonds);
  });
});
