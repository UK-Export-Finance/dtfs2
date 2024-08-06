import { CURRENCY, PaymentMatchingToleranceEntityMockBuilder } from '@ukef/dtfs2-common';

const toleranceIdGenerator = (function* idGenerator(): Generator<number, number, unknown> {
  let id = 0;
  while (true) {
    id += 1;
    yield id;
  }
})();

export const ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES = Object.values(CURRENCY).map((currency) =>
  PaymentMatchingToleranceEntityMockBuilder.forCurrency(currency).withIsActive(true).withThreshold(0).withId(toleranceIdGenerator.next().value).build(),
);
