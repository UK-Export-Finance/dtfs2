import { DataSource } from 'typeorm';
import { Currency, CURRENCY, PaymentMatchingToleranceEntity } from '@ukef/dtfs2-common';

/**
 * Creates an active tolerance entity
 * @param currency - The currency for the tolerance
 * @returns the created entity
 */
const getActiveTolerance = (currency: Currency) => {
  const tolerance = new PaymentMatchingToleranceEntity();
  tolerance.currency = currency;
  tolerance.isActive = true;
  tolerance.threshold = 1;
  tolerance.lastUpdatedByIsSystemUser = true;

  return tolerance;
};

/**
 * Inserts active tolerances for each currency
 * @param dataSource - the sql db data source
 */
export const seedPaymentMatchingTolerances = async (dataSource: DataSource): Promise<void> => {
  const tolerances = [getActiveTolerance(CURRENCY.GBP), getActiveTolerance(CURRENCY.EUR), getActiveTolerance(CURRENCY.USD), getActiveTolerance(CURRENCY.JPY)];

  await dataSource.manager.save(PaymentMatchingToleranceEntity, tolerances);
};
