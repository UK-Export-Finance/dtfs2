import { MOCK_UTILISATION_REPORT_ENTITY } from '@ukef/dtfs2-common';
import { handleUtilisationReportPaymentAddedToFeeRecordEvent } from './payment-added-to-fee-record.event-handler';
import { NotImplementedError } from '../../../../../errors';

describe('handleUtilisationReportPaymentAddedToFeeRecordEvent', () => {
  // TODO FN-1697 - update tests when functionality implemented
  it('throws a NotImplementedError', () => {
    expect(() =>
      handleUtilisationReportPaymentAddedToFeeRecordEvent(MOCK_UTILISATION_REPORT_ENTITY, {
        feeRecordId: 1,
        paymentId: 1,
      }),
    ).toThrow(NotImplementedError);
  });
});
