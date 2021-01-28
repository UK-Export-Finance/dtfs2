const mapFacilityProduct = require('./mapFacilityProduct');

describe('mapFacilityProduct', () => {
  describe('when facilityType is `bond`', () => {
    it('should return bond product name and code', () => {
      const result = mapFacilityProduct({
        facilityType: 'bond',
      });
      expect(result).toEqual({
        code: 'BSS',
        name: 'Bond Support Scheme',
      });
    });
  });

  describe('when facilityType is `loan`', () => {
    it('should return loan product name and code', () => {
      const result = mapFacilityProduct({
        facilityType: 'loan',
      });
      expect(result).toEqual({
        code: 'EWCS',
        name: 'Export Working Capital Scheme',
      });
    });
  });

  describe('when facility has bondType', () => {
    it('should return bond product name and code', () => {
      const result = mapFacilityProduct({
        facilityType: 'bond',
      });
      expect(result).toEqual({
        code: 'BSS',
        name: 'Bond Support Scheme',
      });
    });
  });

  describe('when facility has interestMarginFee', () => {
    it('should return loan product name and code', () => {
      const result = mapFacilityProduct({
        facilityType: 'loan',
      });
      expect(result).toEqual({
        code: 'EWCS',
        name: 'Export Working Capital Scheme',
      });
    });
  });
});
