const mapFacilityType = require('./mapFacilityType');
const { capitalizeFirstLetter } = require('../../../../utils/string');
const CONSTANTS = require('../../../../constants');

describe('mapFacilityType', () => {
  describe('when facilityProduct.code is bond', () => {
    it('should return facility.bondType', () => {
      const mockBondFacility = {
        bondType: 'Bid bond',
        facilityProduct: {
          code: 'BSS',
        },
      };

      const result = mapFacilityType(mockBondFacility);
      expect(result).toEqual(mockBondFacility.bondType);
    });
  });

  describe('when facility is a loan', () => {
    it('should capitalize facilityType', () => {
      const mockLoanFacility = {
        bondType: null,
        facilityType: 'loan',
        facilityProduct: {
          code: 'EWCS',
        },
      };

      const result = mapFacilityType(mockLoanFacility);

      expect(result).toEqual(capitalizeFirstLetter('loan'));
    });
  });


  describe(`when facility is ${CONSTANTS.FACILITIES.FACILITY_TYPE.CASH}`, () => {
    it('should return `Cash facility`', () => {
      const mockCashFacility = {
        facilityProduct: {
          code: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH,
        },
      };

      const result = mapFacilityType(mockCashFacility);

      const expected = `${CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CASH} facility`;
      expect(result).toEqual(expected);
    });
  });

  describe(`when facility is ${CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT}`, () => {
    it('should return `Contingent facility`', () => {
      const mockContingentFacility = {
        facilityProduct: {
          code: CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT,
        },
      };

      const result = mapFacilityType(mockContingentFacility);

      const expected = `${CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CONTINGENT} facility`;

      expect(result).toEqual(expected);
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
