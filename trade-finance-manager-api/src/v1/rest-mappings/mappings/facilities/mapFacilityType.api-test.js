const { FACILITY_TYPE, MAPPED_FACILITY_TYPE } = require('@ukef/dtfs2-common');
const mapFacilityType = require('./mapFacilityType');
const CONSTANTS = require('../../../../constants');

describe('mapFacilityType', () => {
  describe('when facilityProduct.code is bond', () => {
    it('should return facility.bondType', () => {
      const mockBondFacility = {
        bondType: 'Bid bond',
        facilityProduct: {
          code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND,
        },
      };

      const result = mapFacilityType(mockBondFacility);
      expect(result).toEqual(mockBondFacility.bondType);
    });
  });

  describe('when facility is a loan', () => {
    it('should return loan', () => {
      const mockLoanFacility = {
        bondType: null,
        type: FACILITY_TYPE.LOAN,
        facilityProduct: {
          code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN,
        },
      };

      const result = mapFacilityType(mockLoanFacility);

      expect(result).toEqual(MAPPED_FACILITY_TYPE.LOAN);
    });
  });

  describe(`when facility is ${FACILITY_TYPE.CASH}`, () => {
    it('should return `Cash facility`', () => {
      const mockCashFacility = {
        facilityProduct: {
          code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.GEF,
        },
        ukefFacilityType: FACILITY_TYPE.CASH,
      };

      const result = mapFacilityType(mockCashFacility);

      expect(result).toEqual(MAPPED_FACILITY_TYPE.CASH);
    });
  });

  describe(`when facility is ${FACILITY_TYPE.CONTINGENT}`, () => {
    it('should return `Contingent facility`', () => {
      const mockContingentFacility = {
        facilityProduct: {
          code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.GEF,
        },
        ukefFacilityType: FACILITY_TYPE.CONTINGENT,
      };

      const result = mapFacilityType(mockContingentFacility);

      expect(result).toEqual(MAPPED_FACILITY_TYPE.CONTINGENT);
    });
  });

  it('should return null', () => {
    const mockFacility = {
      facilityProduct: {
        code: 'TEST',
      },
    };

    const result = mapFacilityType(mockFacility);
    expect(result).toEqual(null);
  });
});
