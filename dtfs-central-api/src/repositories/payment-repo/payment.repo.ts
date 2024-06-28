import { PaymentEntity } from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';

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
});
