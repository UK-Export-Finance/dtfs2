import { CurrencyAndAmount } from '@ukef/dtfs2-common';

export type FeeRecord = {
  id: number;
  facilityId: string;
  exporter: string;
  reportedFees: CurrencyAndAmount;
  reportedPayments: CurrencyAndAmount;
};
