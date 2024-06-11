import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { FeeRecordEntity, PaymentEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { PaymentRepo } from '../payment-repo';
import { NotFoundError } from '../../errors';

export const FeeRecordRepo = SqlDbDataSource.getRepository(FeeRecordEntity).extend({
  /**
   * Finds all fee record entities linked to a report
   * @param report - A utilisation report
   * @returns The found fee record entities
   */
  async findByReport(report: UtilisationReportEntity): Promise<FeeRecordEntity[]> {
    return await this.findBy({ report });
  },

  /**
   * Finds the fee records attached to the supplied payment
   * @param payment - The payment entity
   * @returns The fee records attached to the payment entity
   */
  async findFeeRecordsAttachedToPayment(payment: PaymentEntity) {
    const paymentWithFeeRecords = await PaymentRepo.findOne({
      where: { id: payment.id },
      relations: { feeRecords: true },
    });

    if (!paymentWithFeeRecords) {
      throw new NotFoundError(`Failed to find a payment with id ${payment.id}`);
    }

    return paymentWithFeeRecords.feeRecords;
  },
});
