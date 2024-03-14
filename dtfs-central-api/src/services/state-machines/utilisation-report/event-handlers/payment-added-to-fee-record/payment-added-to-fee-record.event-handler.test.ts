import { UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { handleUtilisationReportPaymentAddedToFeeRecordEvent } from './payment-added-to-fee-record.event-handler';
import { NotImplementedError } from '../../../../../errors';

describe('handleUtilisationReportPaymentAddedToFeeRecordEvent', () => {
  // TODO FN-1697 - update tests when functionality implemented
  it('throws a NotImplementedError', () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

    // Act / Assert
    expect(() =>
      handleUtilisationReportPaymentAddedToFeeRecordEvent(report, {
        feeRecordId: 1,
        paymentId: 1,
      }),
    ).toThrow(NotImplementedError);
  });
});
