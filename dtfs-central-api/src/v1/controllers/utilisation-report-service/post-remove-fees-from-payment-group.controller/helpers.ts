import { FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { TfmSessionUser } from '../../../../types/tfm/tfm-session-user';
import { executeWithSqlTransaction } from '../../../../helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { InvalidPayloadError } from '../../../../errors';

export const validateAtLeastOneFeeRecordSelected = (selectedFeeRecordIds: number[]) => {
  if (selectedFeeRecordIds.length === 0) {
    throw new InvalidPayloadError('No fee records selected.');
  }
};

export const validateNotAllFeeRecordsSelected = (selectedFeeRecordIds: number[], totalSelectableFeeRecords: number) => {
  if (selectedFeeRecordIds.length >= totalSelectableFeeRecords) {
    throw new InvalidPayloadError('Not all fee records can be selected.');
  }
};

export const removeFeesFromPaymentGroup = async (
  utilisationReport: UtilisationReportEntity,
  feeRecordsInPaymentGroup: FeeRecordEntity[],
  idsOfFeeRecordsToRemove: number[],
  user: TfmSessionUser,
) => {
  const feeRecordsToRemove = feeRecordsInPaymentGroup.filter((record) => idsOfFeeRecordsToRemove.includes(record.id));
  const feeRecordsToUpdate = feeRecordsInPaymentGroup.filter((record) => !idsOfFeeRecordsToRemove.includes(record.id));
  const utilisationReportStateMachine = UtilisationReportStateMachine.forReport(utilisationReport);

  await executeWithSqlTransaction(async (transactionEntityManager) => {
    await utilisationReportStateMachine.handleEvent({
      type: 'REMOVE_FEES_FROM_PAYMENT_GROUP',
      payload: {
        transactionEntityManager,
        feeRecordsToRemove,
        feeRecordsToUpdate,
        requestSource: {
          platform: 'TFM',
          userId: user._id.toString(),
        },
      },
    });
  });
};
