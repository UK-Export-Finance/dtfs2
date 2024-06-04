import { QueryRunner, In } from 'typeorm';
import { ApiError, FeeRecordEntity } from '@ukef/dtfs2-common';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { InvalidPayloadError, NotFoundError, TransactionFailedError } from '../../../../errors';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';
import { TfmSessionUser } from 'src/types/tfm/tfm-session-user';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { NewPaymentDetails } from '../../../../types/utilisation-reports';

/**
 * Adds a payment to a utilisation report within a transaction
 * @param utilisationReportStateMachine - The utilisation report state machine
 * @param feeRecords - The fee record entities to add a payment to
 * @param newPaymentDetails - The new payment to be added
 * @param userId - The id of the user who is adding the payment
 * @param queryRunner - The query runner
 * @throws {TransactionFailedError}
 */
const addPaymentToUtilisationReportWithTransaction = async (
  utilisationReportStateMachine: UtilisationReportStateMachine,
  feeRecords: FeeRecordEntity[],
  newPaymentDetails: NewPaymentDetails,
  userId: string,
  queryRunner: QueryRunner,
) => {
  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    await utilisationReportStateMachine.handleEvent({
      type: 'ADD_A_PAYMENT',
      payload: {
        transactionEntityManager: queryRunner.manager,
        feeRecords,
        paymentDetails: newPaymentDetails,
        requestSource: {
          platform: 'TFM',
          userId,
        },
      },
    });
    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof ApiError) {
      throw new TransactionFailedError(error.message);
    }
    throw new TransactionFailedError('Unknown error');
  } finally {
    await queryRunner.release();
  }
};

/**
 * Adds a payment to the utilisation report with the specified id
 * @param reportId - The report id
 * @param feeRecordIds - The fee record ids linked to the payment
 * @param user - The user adding the payment
 * @param payment - The payment to add
 */
export const addPaymentToUtilisationReport = async (reportId: number, feeRecordIds: number[], user: TfmSessionUser, payment: NewPaymentDetails) => {
  const utilisationReportStateMachine = await UtilisationReportStateMachine.forReportId(reportId);

  const feeRecords = await FeeRecordRepo.findBy({ id: In(feeRecordIds) });
  if (feeRecords.length === 0) {
    throw new NotFoundError(`No fee records found for report with id ${reportId}`);
  }

  const isValidPaymentCurrency = feeRecords.every(({ paymentCurrency }) => paymentCurrency === payment.currency);
  if (!isValidPaymentCurrency) {
    throw new InvalidPayloadError(`Payment currency '${payment.currency}' does not match fee record payment currency`);
  }

  const queryRunner = SqlDbDataSource.createQueryRunner();
  await addPaymentToUtilisationReportWithTransaction(utilisationReportStateMachine, feeRecords, payment, user._id.toString(), queryRunner);
};
