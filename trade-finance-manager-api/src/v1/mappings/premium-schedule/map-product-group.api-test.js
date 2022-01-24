const mapProductGroup = require('./map-product-group');
const CONSTANTS = require('../../../constants');

describe('mapProductGroup', () => {
  describe(`when type is ${CONSTANTS.FACILITIES.FACILITY_TYPE.BOND}`, () => {
    it(`should return ${CONSTANTS.FACILITIES.FACILITY_PRODUCT_GROUP.BOND}`, () => {
      const result = mapProductGroup(CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);
      expect(result).toEqual(CONSTANTS.FACILITIES.FACILITY_PRODUCT_GROUP.BOND);
    });
  });

  describe(`when type is ${CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN}`, () => {
    it(`should return ${CONSTANTS.FACILITIES.FACILITY_PRODUCT_GROUP.LOAN}`, () => {
      const result = mapProductGroup(CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);
      expect(result).toEqual(CONSTANTS.FACILITIES.FACILITY_PRODUCT_GROUP.LOAN);
    });
  });

  it('should return null', () => {
    const result = mapProductGroup();

    expect(result).toEqual(null);
  });
});
