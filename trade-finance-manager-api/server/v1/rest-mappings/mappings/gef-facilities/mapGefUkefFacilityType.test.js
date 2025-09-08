const mapGefUkefFacilityType = require('./mapGefUkefFacilityType');

describe('mapGefUkefFacilityType', () => {
  it('should should return lowercase string', () => {
    const result = mapGefUkefFacilityType('Cash');

    expect(result).toEqual('cash');
  });
});
