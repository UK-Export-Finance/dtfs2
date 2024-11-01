import { REQUEST_PLATFORM_TYPE, UTILISATION_REPORT_STATUS } from '../../constants';
import { FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, UtilisationReportEntityMockBuilder } from '../../test-helpers';

describe('PaymentEntity', () => {
  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.PENDING_RECONCILIATION).build();

  describe('updateWithAdditionalFeeRecords', () => {
    it('adds new fee records to the payment', () => {
      // Arrange
      const payment = PaymentEntityMockBuilder.forCurrency('GBP').build();

      const existingFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).build();
      payment.feeRecords = [existingFeeRecord];

      const firstNewFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).build();
      const secondNewFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(3).build();

      const userId = 'abc123';

      // Act
      payment.updateWithAdditionalFeeRecords({
        additionalFeeRecords: [firstNewFeeRecord, secondNewFeeRecord],
        requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId },
      });

      // Assert
      expect(payment.feeRecords).toEqual(expect.arrayContaining([existingFeeRecord, firstNewFeeRecord, secondNewFeeRecord]));
    });

    it('does not allow adding a fee record which is already attached to payment', () => {
      // Arrange
      const payment = PaymentEntityMockBuilder.forCurrency('GBP').build();

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).build();
      payment.feeRecords = [feeRecord];

      const existingFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).build();
      payment.feeRecords = [existingFeeRecord];

      const feeRecordWithDuplicateId = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).build();

      const userId = 'abc123';

      // Act & Assert
      expect(() => {
        payment.updateWithAdditionalFeeRecords({
          additionalFeeRecords: [feeRecordWithDuplicateId],
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId },
        });
      }).toThrow(Error);

      expect(payment.feeRecords).toHaveLength(1);
      expect(payment.feeRecords).toEqual(expect.arrayContaining([feeRecord]));
    });
  });
});
