const CONSTANTS = require('../../../../constants');
const mapGefFacilityFeeType = require('./mapGefFacilityFeeType');

describe('mapGefFacilityFeeType', () => {
  describe('when feeType is `IN_ARREARS_QUARTLY`', () => {
    it('should return IN_ARREARS', () => {
      const result = mapGefFacilityFeeType('IN_ARREARS_QUARTLY');

      const expected = CONSTANTS.FACILITIES.FACILITY_FEE_TYPE.IN_ARREARS;
      expect(result).toEqual(expected);
    });
  });

  describe('when feeType is `IN_ADVANCE_QUARTERLY`', () => {
    it('should return IN_ADVANCE', () => {
      const result = mapGefFacilityFeeType('IN_ADVANCE_QUARTERLY');

      const expected = CONSTANTS.FACILITIES.FACILITY_FEE_TYPE.IN_ADVANCE;
      expect(result).toEqual(expected);
    });
  });

  describe('when feeType is `AT_MATURITY`', () => {
    it('should return AT_MATURITY', () => {
      const result = mapGefFacilityFeeType('AT_MATURITY');

      const expected = CONSTANTS.FACILITIES.FACILITY_FEE_TYPE.AT_MATURITY;
      expect(result).toEqual(expected);
    });
  });

  it('should return feeType when none matches', () => {
    const result = mapGefFacilityFeeType('In arrear');
    expect(result).toEqual('In arrear');
  });
});
