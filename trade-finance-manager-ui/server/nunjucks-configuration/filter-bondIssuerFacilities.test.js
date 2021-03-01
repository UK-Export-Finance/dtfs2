import bondIssuerFacilities from './filter-bondIssuerFacilities';

describe('nunjuck filters - bondIssuerFacilities', () => {
  it('should only return facilities that have `bond` ukefFacilityType and bondIssuer', () => {
    const mockBonds = [
      {
        _id: '1',
        facilitySnapshot: {
          _id: '1',
          ukefFacilityType: 'bond',
          bondIssuer: 'test',
        },
      },
      {
        _id: '2',
        facilitySnapshot: {
          _id: '2',
          ukefFacilityType: 'bond',
          bondIssuer: 'test',
        },
      },
    ];

    const mockBondsWithoutBondIssuer = [
      {
        _id: '3',
        facilitySnapshot: {
          _id: '3',
          ukefFacilityType: 'bond',
        },
      },
    ];

    const mockLoans = [
      {
        _id: '10',
        facilitySnapshot: {
          _id: '10',
          ukefFacilityType: 'loan',
        },
      },
      {
        _id: '10',
        facilitySnapshot: {
          _id: '10',
          ukefFacilityType: 'loan',
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
