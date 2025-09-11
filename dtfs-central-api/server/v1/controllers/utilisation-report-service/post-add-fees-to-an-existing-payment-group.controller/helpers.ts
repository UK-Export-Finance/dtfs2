import { FeeRecordEntity, PaymentEntity, REQUEST_PLATFORM_TYPE, TfmSessionUser, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { executeWithSqlTransaction } from '../../../../helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../../../services/state-machines/utilisation-report/event/utilisation-report.event-type';

export const addFeesToAnExistingPaymentGroup = async (
  utilisationReport: UtilisationReportEntity,
  feeRecordsToAdd: FeeRecordEntity[],
  existingFeeRecordsInPaymentGroup: FeeRecordEntity[],
  payments: PaymentEntity[],
  user: TfmSessionUser,
) => {
  const utilisationReportStateMachine = UtilisationReportStateMachine.forReport(utilisationReport);

  await executeWithSqlTransaction(async (transactionEntityManager) => {
    await utilisationReportStateMachine.handleEvent({
      type: UTILISATION_REPORT_EVENT_TYPE.ADD_FEES_TO_AN_EXISTING_PAYMENT_GROUP,
      payload: {
        transactionEntityManager,
        feeRecordsToAdd,
        existingFeeRecordsInPaymentGroup,
        payments,
        requestSource: {
          platform: REQUEST_PLATFORM_TYPE.TFM,
          userId: user._id.toString(),
        },
      },
    });
  });
};
