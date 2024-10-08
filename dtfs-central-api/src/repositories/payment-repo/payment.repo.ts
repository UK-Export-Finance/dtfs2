import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { Currency, FEE_RECORD_STATUS, PaymentEntity } from '@ukef/dtfs2-common';
import { NotFoundError } from '../../errors';

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
   * Finds payment entities that are part of the same group as the payment
   * with the supplied id.
   * @param paymentId - The payment id
   * @param reportId - The report id
   * @returns An array of payment entities in the same group as the specified
   * payment, including their fee records and associated reports.
   */
  async findPaymentsInGroupByPaymentIdAndReportIdWithFeeRecords(paymentId: number, reportId: number): Promise<PaymentEntity[]> {
    const payment = await this.findOne({
      where: {
        id: paymentId,
        feeRecords: {
          report: { id: reportId },
        },
      },
      relations: { feeRecords: { payments: { feeRecords: { report: true } } } },
    });

    if (!payment) {
      throw new NotFoundError(`Failed to find payment with id ${paymentId}.`);
    }

    if (payment.feeRecords.length === 0) {
      throw new Error(`Payment with id ${paymentId} has no fee records.`);
    }

    return payment.feeRecords[0].payments;
  },
});
