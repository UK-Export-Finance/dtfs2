import { CURRENCY, PaymentMatchingToleranceEntityMockBuilder } from '@ukef/dtfs2-common';

export const aListOfZeroThresholdActivePaymentMatchingTolerances = () => {
  const toleranceIdGenerator = idGenerator();
  return Object.values(CURRENCY).map((currency) =>
    PaymentMatchingToleranceEntityMockBuilder.forCurrency(currency).withIsActive(true).withThreshold(0).withId(toleranceIdGenerator.next().value).build(),
  );
};

function* idGenerator(): Generator<number, number, unknown> {
  let id = 0;
  while (true) {
    id += 1;
    yield id;
  }
}
