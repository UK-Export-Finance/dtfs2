import { FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { handleFeeRecordAddAPaymentEvent } from './add-a-payment.event-handler';
import { NotImplementedError } from '../../../../../errors';

describe('handleFeeRecordAddAPaymentEvent', () => {
  const UPLOADED_REPORT = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

  it('throws a NotImplementedError', () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(UPLOADED_REPORT).build();

    // Act / Assert
    expect(() =>
      handleFeeRecordAddAPaymentEvent(feeRecord, {
        paymentId: 1,
      }),
    ).toThrow(NotImplementedError);
  });
});
