import { Currency } from '@ukef/dtfs2-common';

export type PaymentMatchingTolerances = {
  [K in Currency]: number;
};
