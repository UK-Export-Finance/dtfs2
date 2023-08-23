const isGefFacility = require('./isGefFacility');

describe('reducer helpers - isGefFacility', () => {
  it('should return true when type is `CASH`', () => {
    const result = isGefFacility('Cash');
    expect(result).toEqual(true);
  });

  it('should return true when type is `CONTINGENT`', () => {
    const result = isGefFacility('Contingent');
    expect(result).toEqual(true);
  });

  it('should return false when type is NOT a GEF facility type', () => {
    const result = isGefFacility('test');
    expect(result).toEqual(false);
  });
});
