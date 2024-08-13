import { In } from 'typeorm';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { Currency, FEE_RECORD_STATUS, PaymentEntity } from '@ukef/dtfs2-common';

export const PaymentRepo = SqlDbDataSource.getRepository(PaymentEntity).extend({
  /**
   * Finds a payment with the supplied payment id which is attached
   * to the utilisation report with the supplied id with the attached
   * fee records and report
   * @param paymentId - The payment id
   * @param reportId - The report id
   * @returns The payment
   */
  async findOneByIdWithFeeRecordsAndReportFilteredById(paymentId: number, reportId: number): Promise<PaymentEntity | null> {
    return await this.findOne({
      where: {
        id: paymentId,
        feeRecords: {
          report: {
            id: reportId,
          },
        },
      },
      relations: { feeRecords: { report: true } },
    });
  },

  /**
   * Checks if a payment entity exists for a report with the supplied id,
   * matching the supplied currency, and having at least one fee record
   * with status 'DOES_NOT_MATCH'
   * @param reportId - The report id
   * @param currency - The payment currency to search by
   * @returns True if a matching payment entity exists, false otherwise
   */
  async existsUnmatchedPaymentOfCurrencyForReportWithId(reportId: number, currency: Currency): Promise<boolean> {
    return await this.exists({
      where: {
        feeRecords: {
          report: { id: reportId },
          status: FEE_RECORD_STATUS.DOES_NOT_MATCH,
        },
        currency,
      },
    });
  },

  /**
   * Finds payment entities with the supplied payment ids which has fee records
   * attached to the utilisation report with the supplied id with the fee
   * records, their payments, and report attached
   * @param ids - The payment ids to search by
   * @param reportId - The report id of the report attached to the fee records
   * @returns The found payment entities
   */
  async findByIdWithFeeRecordsAndReportAndPaymentsFilteredById(ids: number[], reportId: number): Promise<PaymentEntity[]> {
    return await this.find({
      where: {
        id: In(ids),
        feeRecords: {
          report: { id: reportId },
        },
      },
      relations: { feeRecords: { report: true, payments: true } },
    });
  },
});
