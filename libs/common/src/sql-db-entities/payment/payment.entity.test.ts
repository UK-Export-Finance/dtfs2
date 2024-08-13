import { FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, UtilisationReportEntityMockBuilder } from '../../test-helpers';

describe('PaymentEntity', () => {
  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

  describe('updateWithAdditionalFeeRecords', () => {
    it('adds new fee records to the payment', () => {
      // Arrange
      const payment = PaymentEntityMockBuilder.forCurrency('GBP').build();

      const existingFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).build();
      payment.feeRecords = [existingFeeRecord];

      const newFeeRecord1 = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).build();
      const newFeeRecord2 = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(3).build();

      const userId = 'abc123';

      // Act
      payment.updateWithAdditionalFeeRecords({
        feeRecords: [newFeeRecord1, newFeeRecord2],
        requestSource: { platform: 'TFM', userId },
      });

      // Assert
      expect(payment.feeRecords).toEqual(expect.arrayContaining([existingFeeRecord, newFeeRecord1, newFeeRecord2]));
    });

    it('does not allow duplicate fee records to be added to the payment', () => {
      // Arrange
      const payment = PaymentEntityMockBuilder.forCurrency('GBP').build();

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).build();
      payment.feeRecords = [feeRecord];

      const userId = 'abc123';

      // Act & Assert
      expect(() => {
        payment.updateWithAdditionalFeeRecords({
          feeRecords: [feeRecord],
          requestSource: { platform: 'TFM', userId },
        });
      }).toThrow(Error);

      expect(payment.feeRecords).toHaveLength(1);
      expect(payment.feeRecords).toEqual(expect.arrayContaining([feeRecord]));
    });
  });
});
