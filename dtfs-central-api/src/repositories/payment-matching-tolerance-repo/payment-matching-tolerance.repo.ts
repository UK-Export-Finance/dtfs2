import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { Currency, PaymentMatchingToleranceEntity } from '@ukef/dtfs2-common';
import { EntityManager } from 'typeorm';

export const PaymentMatchingToleranceRepo = SqlDbDataSource.getRepository(PaymentMatchingToleranceEntity).extend({
  /**
   * Finds the payment matching tolerance of the supplied currency which is active
   * @param currency - The currency to find the active tolerance for
   * @returns The payment matching tolerance
   */
  async findOneByCurrencyAndIsActiveTrue(currency: Currency): Promise<PaymentMatchingToleranceEntity | null> {
    return await this.findOne({
      where: {
        currency,
        isActive: true,
      },
    });
  },

  withTransaction(transactionEntityManager: EntityManager) {
    const transactionRepository = transactionEntityManager.getRepository(PaymentMatchingToleranceEntity);

    return {
      findOneByCurrencyAndIsActiveTrue: this.findOneByCurrencyAndIsActiveTrue.bind(transactionRepository),
    };
  },
});
