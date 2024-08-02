const { FACILITY_TYPE } = require('@ukef/dtfs2-common');
const mapProductGroup = require('./map-product-group');
const CONSTANTS = require('../../../constants');

describe('mapProductGroup', () => {
  describe(`when type is ${FACILITY_TYPE.BOND}`, () => {
    it(`should return ${CONSTANTS.FACILITIES.FACILITY_PRODUCT_GROUP.BOND}`, () => {
      const result = mapProductGroup(FACILITY_TYPE.BOND);
      expect(result).toEqual(CONSTANTS.FACILITIES.FACILITY_PRODUCT_GROUP.BOND);
    });
  });

  describe(`when type is ${FACILITY_TYPE.LOAN}`, () => {
    it(`should return ${CONSTANTS.FACILITIES.FACILITY_PRODUCT_GROUP.LOAN}`, () => {
      const result = mapProductGroup(FACILITY_TYPE.LOAN);
      expect(result).toEqual(CONSTANTS.FACILITIES.FACILITY_PRODUCT_GROUP.LOAN);
    });
  });

  it('should return null', () => {
    const result = mapProductGroup();

    expect(result).toEqual(null);
  });
});
