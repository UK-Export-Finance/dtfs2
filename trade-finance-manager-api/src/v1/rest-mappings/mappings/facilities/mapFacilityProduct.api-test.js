const mapFacilityProduct = require('./mapFacilityProduct');
const CONSTANTS = require('../../../../constants');

describe('mapFacilityProduct', () => {
  describe(`when type is ${CONSTANTS.FACILITIES.FACILITY_TYPE.BOND}`, () => {
    it('should return bond product name and code', () => {
      const result = mapFacilityProduct(CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);
      expect(result).toEqual({
        code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND,
        name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.BOND,
      });
    });
  });

  describe(`when type is ${CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN}`, () => {
    it('should return loan product name and code', () => {
      const result = mapFacilityProduct(CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);
      expect(result).toEqual({
        code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN,
        name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.LOAN,
      });
    });
  });

  describe(`when type is ${CONSTANTS.FACILITIES.FACILITY_TYPE.CASH}`, () => {
    it('should return Cash product name and code', () => {
      const result = mapFacilityProduct(CONSTANTS.FACILITIES.FACILITY_TYPE.CASH);
      expect(result).toEqual({
        code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.GEF,
        name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.GEF,
      });
    });
  });

  describe(`when type is ${CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT}`, () => {
    it('should return Cash product name and code', () => {
      const result = mapFacilityProduct(CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT);
      expect(result).toEqual({
        code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.GEF,
        name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.GEF,
      });
    });
  });
});
