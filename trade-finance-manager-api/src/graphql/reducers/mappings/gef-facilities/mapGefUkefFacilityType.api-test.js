const mapGefUkefFacilityType = require('./mapGefUkefFacilityType');

describe('mapGefUkefFacilityType', () => {
  it('should should return lowercase string', () => {
    const result = mapGefUkefFacilityType('CASH');

    expect(result).toEqual('cash');
  });
});
