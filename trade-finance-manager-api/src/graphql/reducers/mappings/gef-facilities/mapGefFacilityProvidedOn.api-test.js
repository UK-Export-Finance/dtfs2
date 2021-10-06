const CONSTANTS = require('../../../../constants');

const mapGefFacilityProvidedOn = require('./mapGefFacilityProvidedOn');

describe('mapGefFacilityProvidedOn', () => {
  it('should should return array of text from the given basis', () => {
    const mockArray = [
      CONSTANTS.FACILITIES.FACILITY_PROVIDED_ON_GEF.TERM.ID,
      CONSTANTS.FACILITIES.FACILITY_PROVIDED_ON_GEF.RESOLVING.ID,
      CONSTANTS.FACILITIES.FACILITY_PROVIDED_ON_GEF.COMMITTED.ID,
    ];

    const result = mapGefFacilityProvidedOn(mockArray);

    const expected = [
      CONSTANTS.FACILITIES.FACILITY_PROVIDED_ON_GEF.TERM.TEXT,
      CONSTANTS.FACILITIES.FACILITY_PROVIDED_ON_GEF.RESOLVING.TEXT,
      CONSTANTS.FACILITIES.FACILITY_PROVIDED_ON_GEF.COMMITTED.TEXT,
    ];

    expect(result).toEqual(expected);
  });

  describe(`when ${CONSTANTS.FACILITIES.FACILITY_PROVIDED_ON_GEF.OTHER.ID} is in the array`, () => {
    it('should NOT return text', () => {
      const mockArray = [
        CONSTANTS.FACILITIES.FACILITY_PROVIDED_ON_GEF.OTHER.ID,
        CONSTANTS.FACILITIES.FACILITY_PROVIDED_ON_GEF.RESOLVING.ID,
      ];

      const result = mapGefFacilityProvidedOn(mockArray);

      const expected = [
        CONSTANTS.FACILITIES.FACILITY_PROVIDED_ON_GEF.RESOLVING.TEXT,
      ];

      expect(result).toEqual(expected);
    });
  });
});
