const mapFacilityProduct = require('./mapFacilityProduct');

describe('mapFacilityProduct', () => {
  describe('when facilityType is `bond`', () => {
    it('should return bond product name and code', () => {
      const result = mapFacilityProduct('bond');
      expect(result).toEqual({
        code: 'BSS',
        name: 'Bond Support Scheme',
      });
    });
  });

  describe('when facilityType is `loan`', () => {
    it('should return loan product name and code', () => {
      const result = mapFacilityProduct('loan');
      expect(result).toEqual({
        code: 'EWCS',
        name: 'Export Working Capital Scheme',
      });
    });
  });

  describe('when facilityType is `CASH`', () => {
    it('should return Cash product name and GEF product code', () => {
      const result = mapFacilityProduct('CASH');
      expect(result).toEqual({
        code: 'GEF',
        name: 'Cash',
      });
    });
  });

  describe('when facilityType is `CASH`', () => {
    it('should return Cash product name and GEF product code', () => {
      const result = mapFacilityProduct('CONTINGENT');
      expect(result).toEqual({
        code: 'GEF',
        name: 'Contingent',
      });
    });
  });
});
