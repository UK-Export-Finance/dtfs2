import { FeeRecordEntity, PaymentEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { TfmSessionUser } from '../../../../types/tfm/tfm-session-user';
import { executeWithSqlTransaction } from '../../../../helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';

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
      type: 'ADD_FEES_TO_AN_EXISTING_PAYMENT_GROUP',
      payload: {
        transactionEntityManager,
        feeRecordsToAdd,
        existingFeeRecordsInPaymentGroup,
        payments,
        requestSource: {
          platform: 'TFM',
          userId: user._id.toString(),
        },
      },
    });
  });
};
