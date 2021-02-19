import bondIssuerFacilities from './filter-bondIssuerFacilities';

describe('nunjuck filters - bondIssuerFacilities', () => {
  it('should only return facilities that have `bond` ukefFacilityType and bondIssuer', () => {
    const mockBonds = [
      { ukefFacilityType: 'bond', bondIssuer: 'test' },
      { ukefFacilityType: 'bond', bondIssuer: 'test' },
    ];

    const mockBondsWithoutBondIssuer = [
      { ukefFacilityType: 'bond' },
    ];

    const mockLoans = [
      { ukefFacilityType: 'loan' },
      { ukefFacilityType: 'loan' },
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
