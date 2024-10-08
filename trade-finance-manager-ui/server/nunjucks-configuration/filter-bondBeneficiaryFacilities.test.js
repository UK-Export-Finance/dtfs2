import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import bondBeneficiaryFacilities from './filter-bondBeneficiaryFacilities';

describe('nunjuck filters - bondBeneficiaryFacilities', () => {
  it('should only return facilities that have `Bond` ukefFacilityType and bondBeneficiary', () => {
    const mockBonds = [
      {
        _id: '1',
        facilitySnapshot: {
          _id: '1',
          ukefFacilityType: FACILITY_TYPE.BOND,
          bondBeneficiary: 'test',
        },
      },
      {
        _id: '2',
        facilitySnapshot: {
          _id: '2',
          ukefFacilityType: FACILITY_TYPE.BOND,
          bondBeneficiary: 'test',
        },
      },
    ];

    const mockBondsWithoutBondBeneficiary = [
      {
        _id: '3',
        facilitySnapshot: {
          _id: '3',
          ukefFacilityType: FACILITY_TYPE.BOND,
        },
      },
    ];

    const mockLoans = [
      {
        _id: '10',
        facilitySnapshot: {
          _id: '10',
          ukefFacilityType: FACILITY_TYPE.LOAN,
        },
      },
      {
        _id: '10',
        facilitySnapshot: {
          _id: '10',
          ukefFacilityType: FACILITY_TYPE.LOAN,
        },
      },
    ];

    const mockFacilities = [...mockBonds, ...mockBondsWithoutBondBeneficiary, ...mockLoans];

    const result = bondBeneficiaryFacilities(mockFacilities);
    expect(result).toEqual(mockBonds);
  });
});
