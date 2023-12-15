import { WithId } from 'mongodb';

export type UtilisationData = WithId<{
  facilityId: string;
  /**
   * The '_id' of the associated report from the 'utilisationReports' collection
   */
  reportId: string;
  /**
   * The 'id' (not '_id') of the associated bank in the 'banks' collection
   */
  bankId: string;
  /**
   * 1-indexed month of the start of the report period
   * example: 6 (for June)
   */
  month: number;
  /**
   * Year of the start of the report period
   * example: 2023
   */
  year: number;
  /**
   * Name of the exporter that the GEF is on behalf of
   */
  exporter: string;
  /**
   * Currency of the facility that the fee record is for
   */
  baseCurrency: string;
  /**
   * The current utilisation (drawdown) of the facility by the exporter
   */
  facilityUtilisation: number;
  /**
   * Total amount of money accrued by UKEF for the GEF
   */
  totalFeesAccruedForTheMonth: number;
  /**
   * The fees actually paid to UKEF by the bank
   */
  monthlyFeesPaidToUkef: number;
  /**
   * The currency of the payment made to UKEF by the bank
   */
  paymentCurrency: string;
  /**
   * The exchange rate from the `baseCurrency` to the `paymentCurrency`, or
   * `null` when `baseCurrency` is the same as the `paymentCurrency`
   */
  exchangeRate: number | null;
  payments: null;
}>;
