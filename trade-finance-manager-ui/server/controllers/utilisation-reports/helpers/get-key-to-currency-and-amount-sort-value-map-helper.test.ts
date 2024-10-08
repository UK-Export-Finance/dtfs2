import { getKeyToCurrencyAndAmountSortValueMap, GetKeyToSortValueMapItem } from './get-key-to-currency-and-amount-sort-value-map-helper';

describe('get-key-to-currency-and-amount-sort-value-map-helper', () => {
  describe('getKeyToCurrencyAndAmountSortValueMap', () => {
    it('returns a map where the supplied items are sorted alphabetically by currency and numerically by amount in ascending order', () => {
      // Arrange
      const UNSORTED_ITEMS: GetKeyToSortValueMapItem[] = [
        { key: 0, currency: 'GBP', amount: 100.0 }, // dataSortValue = 1
        { key: 1, currency: 'EUR', amount: 100.0 }, // dataSortValue = 0
        { key: 2, currency: 'USD', amount: 100.0 }, // dataSortValue = 5
        { key: 3, currency: 'JPY', amount: 100.0 }, // dataSortValue = 4
        { key: 4, currency: 'GBP', amount: 200.0 }, // dataSortValue = 3
        { key: 5, currency: 'GBP', amount: 100.1 }, // dataSortValue = 2
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
      const sortValueMap = getKeyToCurrencyAndAmountSortValueMap(UNSORTED_ITEMS);

      // Assert
      expect(sortValueMap).toEqual(EXPECTED_KEY_TO_SORT_VALUE_MAP);
    });

    it("returns a map where the supplied items with undefined 'currency' and 'amount' fields are given the lowest sort values", () => {
      // Arrange
      const UNSORTED_ITEMS: GetKeyToSortValueMapItem[] = [
        { key: 0, currency: 'GBP', amount: 100.0 },
        { key: 1 }, // dataSortValue = 0
        { key: 2, currency: 'EUR', amount: 100.0 },
        { key: 3 }, // dataSortValue = 1
      ];

      const EXPECTED_KEY_TO_SORT_VALUE_MAP_FOR_UNDEFINED_CURRENCY_AND_AMOUNT: Record<number, number> = {
        1: 0,
        3: 1,
      };

      // Act
      const sortValueMap = getKeyToCurrencyAndAmountSortValueMap(UNSORTED_ITEMS);

      // Assert
      expect(sortValueMap).toEqual(expect.objectContaining(EXPECTED_KEY_TO_SORT_VALUE_MAP_FOR_UNDEFINED_CURRENCY_AND_AMOUNT));
    });
  });
});
