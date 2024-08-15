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
        additionalFeeRecords: [newFeeRecord1, newFeeRecord2],
        requestSource: { platform: 'TFM', userId },
      });

      // Assert
      expect(payment.feeRecords).toEqual(expect.arrayContaining([existingFeeRecord, newFeeRecord1, newFeeRecord2]));
    });
  });
});
