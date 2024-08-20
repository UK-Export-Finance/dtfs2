import { CURRENCY, PaymentMatchingToleranceEntityMockBuilder } from '@ukef/dtfs2-common';
import { getIncrementingPositiveIntegerIdGenerator } from '../get-integer-id-generator';

export const aListOfZeroThresholdActivePaymentMatchingTolerances = () => {
  const toleranceIdGenerator = getIncrementingPositiveIntegerIdGenerator(1);
  return Object.values(CURRENCY).map((currency) =>
    PaymentMatchingToleranceEntityMockBuilder.forCurrency(currency).withIsActive(true).withThreshold(0).withId(toleranceIdGenerator.next().value).build(),
  );
};
