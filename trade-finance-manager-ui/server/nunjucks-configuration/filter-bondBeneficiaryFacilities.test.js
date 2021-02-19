import bondBeneficiaryFacilities from './filter-bondBeneficiaryFacilities';

describe('nunjuck filters - bondBeneficiaryFacilities', () => {
  it('should only return facilities that have `bond` ukefFacilityType and bondBeneficiary', () => {
    const mockBonds = [
      { ukefFacilityType: 'bond', bondBeneficiary: 'test' },
      { ukefFacilityType: 'bond', bondBeneficiary: 'test' },
    ];

    const mockBondsWithoutBondBeneficiary = [
      { ukefFacilityType: 'bond'},
    ];

    const mockLoans = [
      { ukefFacilityType: 'loan' },
      { ukefFacilityType: 'loan' },
    ];

    const mockFacilities = [
      ...mockBonds,
      ...mockBondsWithoutBondBeneficiary,
      ...mockLoans,
    ];

    const result = bondBeneficiaryFacilities(mockFacilities);
    expect(result).toEqual(mockBonds);
  });
});
