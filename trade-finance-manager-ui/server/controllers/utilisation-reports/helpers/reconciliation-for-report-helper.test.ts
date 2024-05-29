import { Currency, CurrencyAndAmount, FEE_RECORD_STATUS, FeeRecordStatus } from '@ukef/dtfs2-common';
import { mapFeeRecordItemsToFeeRecordViewModelItems } from './reconciliation-for-report-helper';
import { FeeRecordItem } from '../../../api-response-types';
import { aFeeRecordItem } from '../../../../test-helpers';
import { FeeRecordViewModelCheckboxId, SortedAndFormattedCurrencyAndAmount } from '../../../types/view-models';

describe('reconciliation-for-report-helper', () => {
  describe('mapFeeRecordItemsToFeeRecordViewModelItems', () => {
    const DEFAULT_IS_CHECKBOX_SELECTED = () => false;

    it('maps the fee record facility id, exporter and status to the view model item', () => {
      // Arrange
      const facilityId = '12345678';
      const exporter = 'Test exporter';
      const status = FEE_RECORD_STATUS.TO_DO;

      const feeRecordItems: FeeRecordItem[] = [
        {
          ...aFeeRecordItem(),
          facilityId,
          exporter,
          status,
        },
      ];

      // Act
      const feeRecordViewModelItems = mapFeeRecordItemsToFeeRecordViewModelItems(feeRecordItems, DEFAULT_IS_CHECKBOX_SELECTED);

      // Assert
      expect(feeRecordViewModelItems).toHaveLength(1);
      expect(feeRecordViewModelItems[0].facilityId).toBe(facilityId);
      expect(feeRecordViewModelItems[0].exporter).toBe(exporter);
      expect(feeRecordViewModelItems[0].status).toBe(status);
    });

    it.each([
      { status: FEE_RECORD_STATUS.TO_DO, displayStatus: 'TO DO' },
      { status: FEE_RECORD_STATUS.MATCH, displayStatus: 'MATCH' },
      { status: FEE_RECORD_STATUS.DOES_NOT_MATCH, displayStatus: 'DOES NOT MATCH' },
      { status: FEE_RECORD_STATUS.READY_TO_KEY, displayStatus: 'READY TO KEY' },
      { status: FEE_RECORD_STATUS.RECONCILED, displayStatus: 'RECONCILED' },
    ])("converts the '$status' status to the display status '$displayStatus'", ({ status, displayStatus }) => {
      // Arrange
      const feeRecordItems: FeeRecordItem[] = [
        {
          ...aFeeRecordItem(),
          status,
        },
      ];

      // Act
      const feeRecordViewModelItems = mapFeeRecordItemsToFeeRecordViewModelItems(feeRecordItems, DEFAULT_IS_CHECKBOX_SELECTED);

      // Assert
      expect(feeRecordViewModelItems).toHaveLength(1);
      expect(feeRecordViewModelItems[0].displayStatus).toBe(displayStatus);
    });

    it.each([
      {
        property: 'reportedFees',
        currencyAndAmount: { currency: 'GBP', amount: 314.59 },
        expectedValue: { formattedCurrencyAndAmount: 'GBP 314.59', dataSortValue: 0 },
      },
      {
        property: 'reportedPayments',
        currencyAndAmount: { currency: 'GBP', amount: 314.59 },
        expectedValue: { formattedCurrencyAndAmount: 'GBP 314.59', dataSortValue: 0 },
      },
      {
        property: 'totalReportedPayments',
        currencyAndAmount: { currency: 'GBP', amount: 314.59 },
        expectedValue: { formattedCurrencyAndAmount: 'GBP 314.59', dataSortValue: 0 },
      },
      {
        property: 'paymentsReceived',
        currencyAndAmount: { currency: 'GBP', amount: 314.59 },
        expectedValue: { formattedCurrencyAndAmount: 'GBP 314.59', dataSortValue: 0 },
      },
      {
        property: 'paymentsReceived',
        currencyAndAmount: null,
        expectedValue: { formattedCurrencyAndAmount: undefined, dataSortValue: 0 },
      },
      {
        property: 'totalPaymentsReceived',
        currencyAndAmount: { currency: 'GBP', amount: 314.59 },
        expectedValue: { formattedCurrencyAndAmount: 'GBP 314.59', dataSortValue: 0 },
      },
      {
        property: 'totalPaymentsReceived',
        currencyAndAmount: null,
        expectedValue: { formattedCurrencyAndAmount: undefined, dataSortValue: 0 },
      },
    ] as const)(
      "converts the fee record item '$property' value of '$currencyAndAmount' to '$expectedValue'",
      ({ property, currencyAndAmount, expectedValue }) => {
        // Arrange
        const feeRecordItems: FeeRecordItem[] = [
          {
            ...aFeeRecordItem(),
            [property]: currencyAndAmount,
          },
        ];

        // Act
        const feeRecordViewModelItems = mapFeeRecordItemsToFeeRecordViewModelItems(feeRecordItems, DEFAULT_IS_CHECKBOX_SELECTED);

        // Assert
        expect(feeRecordViewModelItems).toHaveLength(1);
        expect(feeRecordViewModelItems[0][property]).toEqual(expectedValue);
      },
    );

    describe('when there are multiple fee record items', () => {
      const UNSORTED_CURRENCY_AND_AMOUNTS: CurrencyAndAmount[] = [
        { currency: 'GBP', amount: 1000.0 },
        { currency: 'EUR', amount: 1000.0 },
        { currency: 'GBP', amount: 100.0 },
        { currency: 'EUR', amount: 100.0 },
        { currency: 'EUR', amount: 300.0 },
      ];

      const SORTED_AND_FORMATTED_CURRENCY_AND_AMOUNTS: SortedAndFormattedCurrencyAndAmount[] = [
        { formattedCurrencyAndAmount: 'GBP 1,000.00', dataSortValue: 4 },
        { formattedCurrencyAndAmount: 'EUR 1,000.00', dataSortValue: 2 },
        { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 3 },
        { formattedCurrencyAndAmount: 'EUR 100.00', dataSortValue: 0 },
        { formattedCurrencyAndAmount: 'EUR 300.00', dataSortValue: 1 },
      ];

      describe.each([
        { property: 'reportedFees' },
        { property: 'reportedPayments' },
        { property: 'totalReportedPayments' },
        { property: 'paymentsReceived' },
        { property: 'totalPaymentsReceived' },
      ] as const)("when sorting and formatting the '$property' column", ({ property }) => {
        // Arrange
        const feeRecordItems: FeeRecordItem[] = UNSORTED_CURRENCY_AND_AMOUNTS.map((currencyAndAmount) => ({
          ...aFeeRecordItem(),
          [property]: currencyAndAmount,
        }));

        it("sets the 'dataSortValue' such that the items are ordered alphabetically by currency and numerically by amount in ascending order", () => {
          // Act
          const feeRecordViewModelItems = mapFeeRecordItemsToFeeRecordViewModelItems(feeRecordItems, DEFAULT_IS_CHECKBOX_SELECTED);

          // Assert
          SORTED_AND_FORMATTED_CURRENCY_AND_AMOUNTS.forEach(({ dataSortValue }, index) => {
            expect(feeRecordViewModelItems[index][property].dataSortValue).toBe(dataSortValue);
          });
        });

        it("sets the 'formattedCurrencyAndAmount' to be the currency followed by the amount using two decimal places and comma-separated thousands", () => {
          // Act
          const feeRecordViewModelItems = mapFeeRecordItemsToFeeRecordViewModelItems(feeRecordItems, DEFAULT_IS_CHECKBOX_SELECTED);

          // Assert
          SORTED_AND_FORMATTED_CURRENCY_AND_AMOUNTS.forEach(({ formattedCurrencyAndAmount }, index) => {
            expect(feeRecordViewModelItems[index][property].formattedCurrencyAndAmount).toBe(formattedCurrencyAndAmount);
          });
        });
      });
    });

    describe('when sorting the payments received and total payments received columns for fee records with some null values', () => {
      const UNSORTED_CURRENCY_AND_AMOUNT_OR_NULLS: (CurrencyAndAmount | null)[] = [
        null,
        { currency: 'GBP', amount: 100.0 },
        null,
        { currency: 'EUR', amount: 100.0 },
      ];

      const SORTED_AND_FORMATTED_CURRENCY_AND_AMOUNTS: SortedAndFormattedCurrencyAndAmount[] = [
        { formattedCurrencyAndAmount: undefined, dataSortValue: 0 },
        { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 3 },
        { formattedCurrencyAndAmount: undefined, dataSortValue: 1 },
        { formattedCurrencyAndAmount: 'EUR 100.00', dataSortValue: 2 },
      ];

      it.each([{ property: 'paymentsReceived' }, { property: 'totalPaymentsReceived' }] as const)(
        "assigns any null entries to the lowest 'dataSortValue' for the '$property' column sets 'formattedCurrencyAndAmount' to undefined",
        ({ property }) => {
          // Arrange
          const feeRecordItems: FeeRecordItem[] = UNSORTED_CURRENCY_AND_AMOUNT_OR_NULLS.map((currencyAndAmountOrNull) => ({
            ...aFeeRecordItem(),
            [property]: currencyAndAmountOrNull,
          }));

          // Act
          const feeRecordViewModelItems = mapFeeRecordItemsToFeeRecordViewModelItems(feeRecordItems, DEFAULT_IS_CHECKBOX_SELECTED);

          // Assert
          expect(feeRecordViewModelItems).toHaveLength(feeRecordItems.length);
          SORTED_AND_FORMATTED_CURRENCY_AND_AMOUNTS.forEach((expectedValue, index) => {
            expect(feeRecordViewModelItems[index][property]).toEqual(expectedValue);
          });
        },
      );
    });

    describe("when a specific 'isCheckboxSelected' function is specified", () => {
      const FEE_RECORD_ID = 1;
      const PAYMENTS_RECEIVED_CURRENCY: Currency = 'GBP';
      const STATUS: FeeRecordStatus = 'TO_DO';

      const CHECKED_FEE_RECORD_CHECKBOX_ID: FeeRecordViewModelCheckboxId = `feeRecordId-${FEE_RECORD_ID}-reportedPaymentsCurrency-${PAYMENTS_RECEIVED_CURRENCY}-status-${STATUS}`;
      const IS_CHECKBOX_SELECTED = (checkboxId: string) => checkboxId === CHECKED_FEE_RECORD_CHECKBOX_ID;

      it("sets the 'isChecked' property to false when the fee record item does not match the checked checkbox id", () => {
        // Arrange
        const feeRecordItems: FeeRecordItem[] = [
          {
            ...aFeeRecordItem(),
            id: 2,
            paymentsReceived: {
              amount: 100.0,
              currency: 'EUR',
            },
            status: 'DOES_NOT_MATCH',
          },
        ];

        // Act
        const feeRecordViewModelItems = mapFeeRecordItemsToFeeRecordViewModelItems(feeRecordItems, IS_CHECKBOX_SELECTED);

        // Assert
        expect(feeRecordViewModelItems[0].isChecked).toBe(false);
      });

      it("sets the 'isChecked' property to true when the fee record item does match the checked checkbox id", () => {
        // Arrange
        const feeRecordItems: FeeRecordItem[] = [
          {
            ...aFeeRecordItem(),
            id: FEE_RECORD_ID,
            reportedPayments: {
              amount: 100.0,
              currency: PAYMENTS_RECEIVED_CURRENCY,
            },
            status: STATUS,
          },
        ];

        // Act
        const feeRecordViewModelItems = mapFeeRecordItemsToFeeRecordViewModelItems(feeRecordItems, IS_CHECKBOX_SELECTED);

        // Assert
        expect(feeRecordViewModelItems[0].isChecked).toBe(true);
      });
    });
  });
});
