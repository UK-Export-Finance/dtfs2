import { FEE_RECORD_STATUS } from '@ukef/dtfs2-common';
import { mapFeeRecordItemToFeeRecordViewModelItem } from './reconciliation-for-report-helper';
import { FeeRecordItem } from '../../../api-response-types';
import { aFeeRecordItem } from '../../../../test-helpers';

describe('reconciliation-for-report-helper', () => {
  describe('mapFeeRecordItemToFeeRecordViewModelItem', () => {
    it('maps the fee record facility id, exporter and status to the view model item', () => {
      // Arrange
      const facilityId = '12345678';
      const exporter = 'Test exporter';
      const status = FEE_RECORD_STATUS.TO_DO;

      const feeRecordItem: FeeRecordItem = {
        ...aFeeRecordItem(),
        facilityId,
        exporter,
        status,
      };

      // Act
      const feeRecordViewModelItem = mapFeeRecordItemToFeeRecordViewModelItem(feeRecordItem);

      // Assert
      expect(feeRecordViewModelItem.facilityId).toBe(facilityId);
      expect(feeRecordViewModelItem.exporter).toBe(exporter);
      expect(feeRecordViewModelItem.status).toBe(status);
    });

    it.each([
      { status: FEE_RECORD_STATUS.TO_DO, displayStatus: 'TO DO' },
      { status: FEE_RECORD_STATUS.MATCH, displayStatus: 'MATCH' },
      { status: FEE_RECORD_STATUS.DOES_NOT_MATCH, displayStatus: 'DOES NOT MATCH' },
      { status: FEE_RECORD_STATUS.READY_TO_KEY, displayStatus: 'READY TO KEY' },
      { status: FEE_RECORD_STATUS.RECONCILED, displayStatus: 'RECONCILED' },
    ])("converts the '$status' status to the display status '$displayStatus'", ({ status, displayStatus }) => {
      // Arrange
      const feeRecordItem: FeeRecordItem = {
        ...aFeeRecordItem(),
        status,
      };

      // Act
      const feeRecordViewModelItem = mapFeeRecordItemToFeeRecordViewModelItem(feeRecordItem);

      // Assert
      expect(feeRecordViewModelItem.displayStatus).toBe(displayStatus);
    });

    it.each([
      {
        property: 'reportedFees',
        currencyAndAmount: { currency: 'GBP', amount: 314.59 },
        expectedValue: 'GBP 314.59',
      },
      {
        property: 'reportedPayments',
        currencyAndAmount: { currency: 'GBP', amount: 314.59 },
        expectedValue: 'GBP 314.59',
      },
      {
        property: 'totalReportedPayments',
        currencyAndAmount: { currency: 'GBP', amount: 314.59 },
        expectedValue: 'GBP 314.59',
      },
      {
        property: 'paymentsReceived',
        currencyAndAmount: { currency: 'GBP', amount: 314.59 },
        expectedValue: 'GBP 314.59',
      },
      {
        property: 'paymentsReceived',
        currencyAndAmount: null,
        expectedValue: undefined,
      },
      {
        property: 'totalPaymentsReceived',
        currencyAndAmount: { currency: 'GBP', amount: 314.59 },
        expectedValue: 'GBP 314.59',
      },
      {
        property: 'totalPaymentsReceived',
        currencyAndAmount: null,
        expectedValue: undefined,
      },
    ] as const)(
      "converts the fee record item '$property' value of '$currencyAndAmount' to '$expectedValue'",
      ({ property, currencyAndAmount, expectedValue }) => {
        // Assert
        const feeRecordItem: FeeRecordItem = {
          ...aFeeRecordItem(),
          [property]: currencyAndAmount,
        };

        // Act
        const feeRecordViewModelItem = mapFeeRecordItemToFeeRecordViewModelItem(feeRecordItem);

        // Assert
        expect(feeRecordViewModelItem[property]).toBe(expectedValue);
      },
    );
  });
});
