const isGefFacility = require('./isGefFacility');

describe('reducer helpers - isGefFacility', () => {
  it('should return true when facilityType is `CASH`', () => {
    const result = isGefFacility('CASH');
    expect(result).toEqual(true);
  });

  it('should return true when facilityType is `CONTINGENT`', () => {
    const result = isGefFacility('Contingent');
    expect(result).toEqual(true);
  });

  it('should return false when facilityType is NOT a GEF facility type', () => {
    const result = isGefFacility('test');
    expect(result).toEqual(false);
  });
});
