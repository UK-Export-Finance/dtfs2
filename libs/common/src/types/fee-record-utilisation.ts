import { Currency, CurrencyAndAmount } from './currency';

export type FeeRecordUtilisation = {
  /**
   * The fee record id
   */
  feeRecordId: number;
  /**
   * The facility id
   */
  facilityId: string;
  /**
   * The exporter
   */
  exporter: string;
  /**
   * The base currency
   */
  baseCurrency: Currency;
  /**
   * The value of the facility
   */
  value: number;
  /**
   * The utilisation
   */
  utilisation: number;
  /**
   * The cover percentage of the facility
   */
  coverPercentage: number;
  /**
   * UKEFs exposure for the facility
   */
  exposure: number;
  /**
   * The fees accrued for the period
   */
  feesAccrued: CurrencyAndAmount;
  /**
   * The reported fees paid
   */
  feesPayable: CurrencyAndAmount;
};
