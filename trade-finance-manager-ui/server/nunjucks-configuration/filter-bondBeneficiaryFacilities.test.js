import bondBeneficiaryFacilities from './filter-bondBeneficiaryFacilities';

describe('nunjuck filters - bondBeneficiaryFacilities', () => {
  it('should only return facilities that have `bond` ukefFacilityType and bondBeneficiary', () => {
    const mockBonds = [
      {
        _id: '1',
        facilitySnapshot: {
          _id: '1',
          ukefFacilityType: 'bond',
          bondBeneficiary: 'test',
        },
      },
      {
        _id: '2',
        facilitySnapshot: {
          _id: '2',
          ukefFacilityType: 'bond',
          bondBeneficiary: 'test',
        },
      },
    ];

    const mockBondsWithoutBondBeneficiary = [
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
      ...mockBondsWithoutBondBeneficiary,
      ...mockLoans,
    ];

    const result = bondBeneficiaryFacilities(mockFacilities);
    expect(result).toEqual(mockBonds);
  });
});
