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
  if (selectedFeeRecordIds.length === totalSelectableFeeRecords) {
    throw new InvalidPayloadError('Not all fee records can be selected.');
  }
};

export const removeFeesFromPayment = async (
  utilisationReport: UtilisationReportEntity,
  allFeeRecords: FeeRecordEntity[],
  selectedFeeRecordIds: number[],
  user: TfmSessionUser,
) => {
  const selectedFeeRecords = allFeeRecords.filter((record) => selectedFeeRecordIds.includes(record.id));
  const otherFeeRecords = allFeeRecords.filter((record) => !selectedFeeRecordIds.includes(record.id));

  const utilisationReportStateMachine = UtilisationReportStateMachine.forReport(utilisationReport);

  await executeWithSqlTransaction(async (transactionEntityManager) => {
    await utilisationReportStateMachine.handleEvent({
      type: 'REMOVE_PAYMENT_FEES',
      payload: {
        transactionEntityManager,
        selectedFeeRecords,
        otherFeeRecords,
        requestSource: {
          platform: 'TFM',
          userId: user._id.toString(),
        },
      },
    });
  });
};
