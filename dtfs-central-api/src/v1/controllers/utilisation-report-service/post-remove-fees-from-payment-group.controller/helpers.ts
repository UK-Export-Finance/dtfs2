import { FeeRecordEntity, REQUEST_PLATFORM_TYPE, TfmSessionUser, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../../../services/state-machines/utilisation-report/event/utilisation-report.event-type';
import { executeWithSqlTransaction } from '../../../../helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';

export const removeFeesFromPaymentGroup = async (
  utilisationReport: UtilisationReportEntity,
  feeRecordsToRemove: FeeRecordEntity[],
  otherFeeRecordsInGroup: FeeRecordEntity[],
  user: TfmSessionUser,
) => {
  const utilisationReportStateMachine = UtilisationReportStateMachine.forReport(utilisationReport);

  await executeWithSqlTransaction(async (transactionEntityManager) => {
    await utilisationReportStateMachine.handleEvent({
      type: UTILISATION_REPORT_EVENT_TYPE.REMOVE_FEES_FROM_PAYMENT_GROUP,
      payload: {
        transactionEntityManager,
        feeRecordsToRemove,
        otherFeeRecordsInGroup,
        requestSource: {
          platform: REQUEST_PLATFORM_TYPE.TFM,
          userId: user._id.toString(),
        },
      },
    });
  });
};
