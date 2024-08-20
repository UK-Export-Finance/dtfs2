import { CURRENCY, PaymentMatchingToleranceEntityMockBuilder } from '@ukef/dtfs2-common';
import { getSqlIdGenerator } from '../get-sql-id-generator';

export const aListOfZeroThresholdActivePaymentMatchingTolerances = () => {
  const toleranceIdGenerator = getSqlIdGenerator();
  return Object.values(CURRENCY).map((currency) =>
    PaymentMatchingToleranceEntityMockBuilder.forCurrency(currency).withIsActive(true).withThreshold(0).withId(toleranceIdGenerator.next().value).build(),
  );
};
