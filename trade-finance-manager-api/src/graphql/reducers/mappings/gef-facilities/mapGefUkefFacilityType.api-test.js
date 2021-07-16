const mapUkefFacilityType = require('./mapUkefFacilityType');

describe('mapUkefFacilityType', () => {
  it('should should return lowercase string', () => {
    const result = mapUkefFacilityType('CASH');

    expect(result).toEqual('cash');
  });
});
