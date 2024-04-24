import { FeeRecordViewModelItem, mapFeeRecordItemToFeeRecordViewModelItem } from './reconciliation-for-report-helper';
import { FeeRecordItem } from '../../../api-response-types';

describe('reconciliation-for-report-helper', () => {
  describe('mapFeeRecordItemToFeeRecordViewModelItem', () => {
    it('maps the fee record item to the fee record view model item ', () => {
      // Arrange
      const feeRecordItem: FeeRecordItem = {
        facilityId: '12345678',
        exporter: 'Test exporter',
        reportedFees: {
          currency: 'GBP',
          amount: 314.59,
        },
        reportedPayments: {
          currency: 'EUR',
          amount: 100.0,
        },
        totalReportedPayments: {
          currency: 'EUR',
          amount: 100.0,
        },
        paymentsReceived: {
          currency: 'JPY',
          amount: 123.456,
        },
        totalPaymentsReceived: {
          currency: 'JPY',
          amount: 654.321,
        },
        status: 'TO_DO',
      };

      // Act
      const feeRecordViewModelItem = mapFeeRecordItemToFeeRecordViewModelItem(feeRecordItem);

      // Assert
      expect(feeRecordViewModelItem).toEqual<FeeRecordViewModelItem>({
        facilityId: '12345678',
        exporter: 'Test exporter',
        reportedFees: 'GBP 314.59',
        reportedPayments: 'EUR 100.00',
        totalReportedPayments: 'EUR 100.00',
        paymentsReceived: 'JPY 123.46',
        totalPaymentsReceived: 'JPY 654.32',
        status: 'TO_DO',
        displayStatus: 'TO DO',
      });
    });
  });
});
