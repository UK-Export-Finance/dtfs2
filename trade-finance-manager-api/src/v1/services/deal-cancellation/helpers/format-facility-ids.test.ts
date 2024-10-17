import { formatFacilityIds } from './format-facility-ids';

describe('formatFacilityIds', () => {
  it('formats the id correctly', () => {
    // Arrange
    const facilityIds = ['facilityId1', 'facilityId2', 'facilityId3', 'facilityId4'];

    // Act
    const result = formatFacilityIds(facilityIds);

    // Assert
    expect(result).toEqual(
      ` 1. Facility ID ${facilityIds[0]}
 2. Facility ID ${facilityIds[1]}
 3. Facility ID ${facilityIds[2]}
 4. Facility ID ${facilityIds[3]}`,
    );
  });
});
