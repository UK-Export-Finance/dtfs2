import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { Currency, FEE_RECORD_STATUS, PaymentEntity } from '@ukef/dtfs2-common';
import { In } from 'typeorm';

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
   * Checks if a payment entity exists for a report with the
   * supplied id and matching the supplied currency
   * @param reportId - The report id
   * @param currency - The payment currency to search by
   * @returns True if a matching payment entity exists, false otherwise
   */
  async existsByReportIdAndCurrency(reportId: number, currency: Currency): Promise<boolean> {
    return await this.exists({
      where: {
        feeRecords: {
          report: { id: reportId },
          status: In([FEE_RECORD_STATUS.DOES_NOT_MATCH]),
        },
        currency,
      },
    });
  },
});
