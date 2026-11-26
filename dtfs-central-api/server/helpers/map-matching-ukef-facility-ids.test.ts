import { mapMatchingUkefFacilityIds } from './map-matching-ukef-facility-ids';

describe('mapMatchingUkefFacilityIds', () => {
  it('should return true for matching UKEF facility IDs and false for unmatched IDs', () => {
    // Arrange
    const matchingGefFacilityIdDocuments = [
      { facilitySnapshot: { ukefFacilityId: '12345678' } },
      { facilitySnapshot: { ukefFacilityId: null } },
      { facilitySnapshot: { ukefFacilityId: '87654321' } },
    ];
    const ukefFacilityIds = ['12345678', '11111111', '87654321'];

    // Act
    const result = mapMatchingUkefFacilityIds(matchingGefFacilityIdDocuments, ukefFacilityIds);

    // Assert
    const expectedResult = {
      '12345678': true,
      '11111111': false,
      '87654321': true,
    };
    expect(result).toEqual(expectedResult);
  });
});
