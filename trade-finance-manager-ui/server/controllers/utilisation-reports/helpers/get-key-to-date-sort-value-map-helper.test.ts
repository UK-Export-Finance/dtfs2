import { getKeyToDateSortValueMap, GetKeyToDateSortValueMapItem } from './get-key-to-date-sort-value-map-helper';

describe('get-key-to-currency-and-amount-sort-value-map-helper', () => {
  describe('getKeyToCurrencyAndAmountSortValueMap', () => {
    it('returns a map where the supplied items are sorted by date ascending', () => {
      // Arrange
      const UNSORTED_ITEMS: GetKeyToDateSortValueMapItem[] = [
        { key: 0, date: '2024-01-01T12:30:00.000' }, // dataSortValue = 1
        { key: 1, date: '2024-01-01T12:00:00.000' }, // dataSortValue = 0
        { key: 2, date: '2025-01-01T12:00:00.000' }, // dataSortValue = 5
        { key: 3, date: '2024-07-07T12:00:00.000' }, // dataSortValue = 4
        { key: 4, date: '2024-02-15T12:00:00.000' }, // dataSortValue = 3
        { key: 5, date: '2024-02-01T12:00:00.000' }, // dataSortValue = 2
      ];

      const EXPECTED_KEY_TO_SORT_VALUE_MAP: Record<number, number> = {
        0: 1,
        1: 0,
        2: 5,
        3: 4,
        4: 3,
        5: 2,
      };

      // Act
      const sortValueMap = getKeyToDateSortValueMap(UNSORTED_ITEMS);

      // Assert
      expect(sortValueMap).toEqual(EXPECTED_KEY_TO_SORT_VALUE_MAP);
    });

    it("returns a map where the supplied items with undefined 'date' field are given the lowest sort values", () => {
      // Arrange
      const UNSORTED_ITEMS: GetKeyToDateSortValueMapItem[] = [
        { key: 0, date: '2024-01-01T00:00:00.000' },
        { key: 1 }, // dataSortValue = 0
        { key: 2, date: '2024-01-01T00:00:00.000' },
        { key: 3 }, // dataSortValue = 1
      ];

      const EXPECTED_KEY_TO_SORT_VALUE_MAP_FOR_UNDEFINED_DATE: Record<number, number> = {
        1: 0,
        3: 1,
      };

      // Act
      const sortValueMap = getKeyToDateSortValueMap(UNSORTED_ITEMS);

      // Assert
      expect(sortValueMap).toEqual(expect.objectContaining(EXPECTED_KEY_TO_SORT_VALUE_MAP_FOR_UNDEFINED_DATE));
    });
  });
});
