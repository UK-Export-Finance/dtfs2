import { mapCheckedCheckboxesToRecord } from './checkbox-id-helper';

describe('checkbox id helper', () => {
  describe('mapCheckedCheckboxesToRecord', () => {
    it('maps the checked checkbox ids', () => {
      // Act
      const mappedCheckboxes = mapCheckedCheckboxesToRecord(['feeRecordId-7', 'feeRecordId-77']);

      // Assert
      expect(mappedCheckboxes).toEqual({
        'feeRecordId-7': true,
        'feeRecordId-77': true,
      });
    });
  });
});
