import { FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { TfmSessionUser } from '../../../../types/tfm/tfm-session-user';
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
      type: 'REMOVE_FEES_FROM_PAYMENT_GROUP',
      payload: {
        transactionEntityManager,
        feeRecordsToRemove,
        otherFeeRecordsInGroup,
        requestSource: {
          platform: 'TFM',
          userId: user._id.toString(),
        },
      },
    });
  });
};
