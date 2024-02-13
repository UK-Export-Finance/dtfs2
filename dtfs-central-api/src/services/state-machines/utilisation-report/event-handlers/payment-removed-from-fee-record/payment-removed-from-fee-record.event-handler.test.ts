import { MOCK_UTILISATION_REPORT_ENTITY } from '@ukef/dtfs2-common';
import { handleUtilisationReportPaymentRemovedFromFeeRecordEvent } from './payment-removed-from-fee-record.event-handler.ts';
import { NotImplementedError } from '../../../../../errors';

describe('handleUtilisationReportPaymentRemovedFromFeeRecordEvent', () => {
  // TODO FN-1697 - update tests when functionality implemented
  it('throws a NotImplementedError', () => {
    expect(() =>
      handleUtilisationReportPaymentRemovedFromFeeRecordEvent(MOCK_UTILISATION_REPORT_ENTITY, {
        feeRecordId: 1,
        paymentId: 1,
      }),
    ).toThrow(NotImplementedError);
  });
});
