const mapFacilityProduct = require('./mapFacilityProduct');
const CONSTANTS = require('../../../../constants');

describe('mapFacilityProduct', () => {
  describe(`when facilityType is ${CONSTANTS.FACILITIES.FACILITY_TYPE.BOND}`, () => {
    it('should return bond product name, displayName and code', () => {
      const result = mapFacilityProduct(CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);
      expect(result).toEqual({
        code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND,
        name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.BOND,
        displayName: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.BOND,
      });
    });
  });

  describe(`when facilityType is ${CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN}`, () => {
    it('should return loan product name, displayName and code', () => {
      const result = mapFacilityProduct(CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);
      expect(result).toEqual({
        code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN,
        name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.LOAN,
        displayName: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.LOAN,
      });
    });
  });

  describe(`when facilityType is ${CONSTANTS.FACILITIES.FACILITY_TYPE.CASH}`, () => {
    it('should return Cash product name, displayName and GEF product code', () => {
      const result = mapFacilityProduct(CONSTANTS.FACILITIES.FACILITY_TYPE.CASH);
      expect(result).toEqual({
        code: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH,
        name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CASH,
        displayName: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.GEF,
      });
    });
  });

  describe(`when facilityType is ${CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT}`, () => {
    it('should return Cash product name, displayName and GEF product code', () => {
      const result = mapFacilityProduct(CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT);
      expect(result).toEqual({
        code: CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT,
        name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CONTINGENT,
        displayName: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.GEF,
      });
    });
  });
});
