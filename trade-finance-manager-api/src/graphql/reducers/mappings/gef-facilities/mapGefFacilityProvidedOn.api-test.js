const { titleCaseString } = require('../../../../utils/string');

const mapGefFacilityProvidedOn = require('./mapGefFacilityProvidedOn');

describe('mapGefFacilityProvidedOn', () => {
  it('should should return array of title cased string', () => {
    const mockArray = [
      'TESTING',
      'MOCK',
    ];
    const result = mapGefFacilityProvidedOn(mockArray);

    const expected = [
      titleCaseString(mockArray[0]),
      titleCaseString(mockArray[1]),
    ];

    expect(result).toEqual(expected);
  });
});
