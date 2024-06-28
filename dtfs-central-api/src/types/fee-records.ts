import { CurrencyAndAmount, FeeRecordStatus } from '@ukef/dtfs2-common';

export type FeeRecord = {
  /**
   * The fee record id
   */
  id: number;
  /**
   * The facility id
   */
  facilityId: string;
  /**
   * The exporter
   */
  exporter: string;
  /**
   * The fees paid to UKEF for the period in the actual payment currency
   */
  reportedFees: CurrencyAndAmount;
  /**
   * The fees paid to UKEF converted to the payment currency
   */
  reportedPayments: CurrencyAndAmount;
};

export type FeeRecordToKey = FeeRecord & {
  paymentsReceived: CurrencyAndAmount[];
  status: FeeRecordStatus;
};
