import { CURRENCY, PaymentMatchingToleranceEntity } from '@ukef/dtfs2-common';
import { EntityManager } from 'typeorm';
import { PaymentMatchingTolerances } from '../../../types/payment-matching-tolerances';
import { NotFoundError } from '../../../errors';

const mapActivePaymentMatchingToleranceEntitiesToPaymentMatchingTolerances = (
  activeToleranceEntities: PaymentMatchingToleranceEntity[],
): PaymentMatchingTolerances => {
  return Object.values(CURRENCY).reduce((partialTolerances, currency) => {
    const currencyTolerance = activeToleranceEntities.find((tolerance) => tolerance.currency === currency);
    if (!currencyTolerance) {
      throw new NotFoundError(`No tolerance found for currency ${currency}`);
    }
    return { ...partialTolerances, [currency]: currencyTolerance.threshold };
  }, {} as Partial<PaymentMatchingTolerances>) as PaymentMatchingTolerances;
};

export const getActivePaymentMatchingTolerances = async (transactionEntityManager: EntityManager): Promise<PaymentMatchingTolerances> => {
  const activeToleranceEntities = await transactionEntityManager.findBy(PaymentMatchingToleranceEntity, { isActive: true });
  return mapActivePaymentMatchingToleranceEntitiesToPaymentMatchingTolerances(activeToleranceEntities);
};
