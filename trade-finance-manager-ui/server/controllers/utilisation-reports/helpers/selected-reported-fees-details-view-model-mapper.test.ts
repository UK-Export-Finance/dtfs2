import { SelectedFeeRecordsDetailsResponseBody } from '../../../api-response-types';
import { mapToSelectedReportedFeesDetailsViewModel } from '.';

describe('selected-reported-fees-details-view-model-mapper', () => {
  describe('mapToSelectedReportedFeesDetailsViewModel', () => {
    it('should correctly map fee records to the selected reported fees details view model', () => {
      // Arrange
      const multipleFeeRecordData: SelectedFeeRecordsDetailsResponseBody = {
        ...aSelectedFeeRecordsDetailsResponseBody(),
        feeRecords: [
          {
            id: 456,
            facilityId: '000123',
            exporter: 'Export Company A',
            reportedFee: { amount: 2000, currency: 'EUR' },
            reportedPayments: { amount: 3000, currency: 'USD' },
          },
          {
            id: 789,
            facilityId: '000456',
            exporter: 'Export Company B',
            reportedFee: { amount: 5000, currency: 'GBP' },
            reportedPayments: { amount: 6000, currency: 'EUR' },
          },
        ],
      };

      // Act
      const result = mapToSelectedReportedFeesDetailsViewModel(multipleFeeRecordData);

      // Assert
      expect(result).toEqual({
        feeRecords: [
          {
            id: 456,
            facilityId: '000123',
            exporter: 'Export Company A',
            reportedFees: { formattedCurrencyAndAmount: 'EUR 2,000.00', dataSortValue: 0 },
            reportedPayments: { formattedCurrencyAndAmount: 'USD 3,000.00', dataSortValue: 1 },
          },
          {
            id: 789,
            facilityId: '000456',
            exporter: 'Export Company B',
            reportedFees: { formattedCurrencyAndAmount: 'GBP 5,000.00', dataSortValue: 1 },
            reportedPayments: { formattedCurrencyAndAmount: 'EUR 6,000.00', dataSortValue: 0 },
          },
        ],
        totalReportedPayments: 'JPY 1,000.00',
      });
    });

    function aSelectedFeeRecordsDetailsResponseBody(): SelectedFeeRecordsDetailsResponseBody {
      return {
        bank: { name: 'Test' },
        reportPeriod: { start: { month: 2, year: 2024 }, end: { month: 4, year: 2024 } },
        totalReportedPayments: { amount: 1000, currency: 'JPY' },
        feeRecords: [
          {
            id: 456,
            facilityId: '000123',
            exporter: 'Export Company',
            reportedFee: { amount: 2000, currency: 'EUR' },
            reportedPayments: { amount: 3000, currency: 'USD' },
          },
        ],
        payments: [
          {
            dateReceived: '2020-02-01T00:00:00.000Z',
            currency: 'USD',
            amount: 2000,
            reference: 'A payment',
          },
        ],
        canAddToExistingPayment: true,
      };
    }
  });
});
