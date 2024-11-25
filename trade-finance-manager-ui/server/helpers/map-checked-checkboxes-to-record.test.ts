import { mapCheckedCheckboxesToRecord } from './map-checked-checkboxes-to-record';

describe('map-checked-checkboxes-to-record', () => {
  describe('mapCheckedCheckboxesToRecord', () => {
    it('should return a record with a key for each checkbox id with value true', () => {
      // Arrange
      const firstId = 'first-id';
      const secondId = 'second-id';
      const ids = [firstId, secondId];

      // Act
      const result = mapCheckedCheckboxesToRecord(ids);

      // Assert
      expect(result).toEqual({
        [firstId]: true,
        [secondId]: true,
      });
    });

    it('should return an empty object if no ids are provided', () => {
      // Arrange
      const ids: string[] = [];

      // Act
      const result = mapCheckedCheckboxesToRecord(ids);

      // Assert
      expect(result).toEqual({});
    });
  });
});
