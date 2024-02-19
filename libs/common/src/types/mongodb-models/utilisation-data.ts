import { WithId } from 'mongodb';
import { Currency } from '../currency';
import { ReportPeriod } from '../utilisation-reports';
import { Prettify } from '../types-helper';

export type UtilisationData = Prettify<
  WithId<{
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
     * Start and end dates of the report period
     * @example
     * { start: { month: 1, year: 2023 }, end: { month: 1, year: 2023 } }
     */
    reportPeriod: ReportPeriod;
    /**
     * Name of the exporter that the GEF is on behalf of
     */
    exporter: string;
    /**
     * Currency of the facility that the fee record is for
     */
    baseCurrency: Currency;
    /**
     * The current utilisation (drawdown) of the facility by the exporter
     */
    facilityUtilisation: number;
    /**
     * Total amount of money accrued by UKEF for the GEF
     */
    totalFeesAccruedForTheMonth: number;
    /**
     * The currency of the total amount of money accrued by UKEF for the GEF
     */
    totalFeesAccruedForTheMonthCurrency: Currency;
    /**
     * The exchange rate from the `baseCurrency` to the `totalFeesAccruedForTheMonthCurrency`
     */
    totalFeesAccruedForTheMonthExchangeRate: number;
    /**
     * The fees actually paid to UKEF by the bank
     */
    monthlyFeesPaidToUkef: number;
    /**
     * The currency of the fees actually paid to UKEF by the bank
     */
    monthlyFeesPaidToUkefCurrency: Currency;
    /**
     * The currency of the payment made to UKEF by the bank
     */
    paymentCurrency: Currency;
    /**
     * The exchange rate from the `baseCurrency` to the `paymentCurrency`
     */
    paymentExchangeRate: number;
    payments: null;
  }>
>;
