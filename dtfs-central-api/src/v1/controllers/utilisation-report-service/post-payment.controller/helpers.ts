import { In } from 'typeorm';
import { FeeRecordEntity, FeeRecordStatus, REQUEST_PLATFORM_TYPE } from '@ukef/dtfs2-common';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { InvalidPayloadError, NotFoundError } from '../../../../errors';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';
import { TfmSessionUser } from '../../../../types/tfm/tfm-session-user';
import { NewPaymentDetails } from '../../../../types/utilisation-reports';
import { executeWithSqlTransaction } from '../../../../helpers';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../../../services/state-machines/utilisation-report/event/utilisation-report.event-type';

/**
 * Adds a payment to the utilisation report with the specified id and
 * returns the resulting status of the fee record(s) it was added against
 * @param reportId - The report id
 * @param feeRecordIds - The fee record ids linked to the payment
 * @param user - The user adding the payment
 * @param payment - The payment to add
 * @returns the resulting fee record status
 */
export const addPaymentToUtilisationReport = async (
  reportId: number,
  feeRecordIds: number[],
  user: TfmSessionUser,
  payment: NewPaymentDetails,
): Promise<FeeRecordStatus> => {
  const utilisationReportStateMachine = await UtilisationReportStateMachine.forReportId(reportId);

  const feeRecords = await FeeRecordRepo.findBy({ id: In(feeRecordIds) });
  if (feeRecords.length === 0) {
    throw new NotFoundError(`No fee records found for report with id ${reportId}`);
  }

  const isValidPaymentCurrency = feeRecords.every(({ paymentCurrency }) => paymentCurrency === payment.currency);
  if (!isValidPaymentCurrency) {
    throw new InvalidPayloadError(`Payment currency '${payment.currency}' does not match fee record payment currency`);
  }

  return await executeWithSqlTransaction<FeeRecordStatus>(async (transactionEntityManager) => {
    await utilisationReportStateMachine.handleEvent({
      type: UTILISATION_REPORT_EVENT_TYPE.ADD_A_PAYMENT,
      payload: {
        transactionEntityManager,
        feeRecords,
        paymentDetails: payment,
        requestSource: {
          platform: REQUEST_PLATFORM_TYPE.TFM,
          userId: user._id.toString(),
        },
      },
    });

    const { status: updatedStatus } = await transactionEntityManager.findOneByOrFail(FeeRecordEntity, { id: feeRecords[0].id });

    return updatedStatus;
  });
};
