import { CurrencyAndAmount } from '@ukef/dtfs2-common';
import {
  GetFeeRecordItemIndexToDataSortValueMapItem,
  getFeeRecordItemIndexToDataSortValueMap,
} from './get-fee-record-item-index-to-data-sort-value-map-helper';

describe('get-fee-record-item-index-to-data-sort-value-map-helper', () => {
  describe('getFeeRecordItemIndexToDataSortValueMap', () => {
    // Arrange
    const FEE_RECORD_ITEMS: GetFeeRecordItemIndexToDataSortValueMapItem[] = [
      { feeRecordIndex: 0, currency: 'GBP', amount: 100.0 }, // dataSortValue = 3
      { feeRecordIndex: 1, currency: 'EUR', amount: 100.0 }, // dataSortValue = 2
      { feeRecordIndex: 2, currency: 'USD', amount: 100.0 }, // dataSortValue = 7
      { feeRecordIndex: 3 }, // dataSortValue = 0
      { feeRecordIndex: 4, currency: 'JPY', amount: 100.0 }, // dataSortValue = 6
      { feeRecordIndex: 5, currency: 'GBP', amount: 200.0 }, // dataSortValue = 5
      { feeRecordIndex: 6 }, // dataSortValue = 1
      { feeRecordIndex: 7, currency: 'GBP', amount: 100.1 }, // dataSortValue = 4
    ];

    const EXPECTED_INDEX_TO_DATA_SORT_VALUE_MAP: Record<number, number> = {
      0: 3,
      1: 2,
      2: 7,
      3: 0,
      4: 6,
      5: 5,
      6: 1,
      7: 4,
    };

    const FEE_RECORD_ITEMS_WITH_NULL_VALUES = FEE_RECORD_ITEMS.filter((item): item is { feeRecordIndex: number } => !item.currency);
    const FEE_RECORD_ITEMS_WITH_NON_NULL_VALUES = FEE_RECORD_ITEMS.filter((item): item is CurrencyAndAmount & { feeRecordIndex: number } =>
      Boolean(item.currency),
    );

    // Act
    const dataSortValueMap = getFeeRecordItemIndexToDataSortValueMap(FEE_RECORD_ITEMS);

    // Assert
    it("assigns the lowest data sort values to the items with null 'CurrencyAndAmount' objects", () => {
      FEE_RECORD_ITEMS_WITH_NULL_VALUES.forEach((item) => {
        const expectedDataSortValue = EXPECTED_INDEX_TO_DATA_SORT_VALUE_MAP[item.feeRecordIndex];
        expect(dataSortValueMap[item.feeRecordIndex]).toBe(expectedDataSortValue);
      });
    });

    FEE_RECORD_ITEMS_WITH_NON_NULL_VALUES.forEach((item) => {
      const expectedDataSortValue = EXPECTED_INDEX_TO_DATA_SORT_VALUE_MAP[item.feeRecordIndex];
      it(`assigns the data sort value '${expectedDataSortValue}' to the item with currency '${item.currency}' and amount '${item.amount}'`, () => {
        expect(dataSortValueMap[item.feeRecordIndex]).toBe(expectedDataSortValue);
      });
    });
  });
});
