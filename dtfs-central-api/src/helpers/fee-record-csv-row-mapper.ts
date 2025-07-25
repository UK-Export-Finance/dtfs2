import {
  DbRequestSource,
  FeeRecordEntity,
  UtilisationReportEntity,
  UTILISATION_REPORT_HEADERS,
  FeeRecordStatus,
  UtilisationReportRawCsvData,
  FEE_RECORD_STATUS,
  formatCurrencyUpperCase,
} from '@ukef/dtfs2-common';

type FeeRecordCsvRowToSqlEntityParams = {
  dataEntry: UtilisationReportRawCsvData;
  requestSource: DbRequestSource;
  report: UtilisationReportEntity;
};

/**
 * Casts a value to a number or defaults
 * @param maybeString - A value which may be a string
 * @param defaultNumber - The number to default the value to
 * @returns Either the `maybeString` as a number or the default number
 */
const asNumberOrDefault = (maybeString: string | undefined | null, defaultNumber: number) => (maybeString ? Number(maybeString) : defaultNumber);

/**
 * Converts a csv data row to the SQL entity
 * @param param0 - The parameters required to create the SQL entity
 * @returns The SQL entity
 */
export const feeRecordCsvRowToSqlEntity = ({ dataEntry, requestSource, report }: FeeRecordCsvRowToSqlEntityParams): FeeRecordEntity => {
  const feesPaidToUkefForThePeriod = Number(dataEntry[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD]);
  const status: FeeRecordStatus = feesPaidToUkefForThePeriod === 0 ? FEE_RECORD_STATUS.MATCH : FEE_RECORD_STATUS.TO_DO;

  const paymentCurrency = dataEntry[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY] || dataEntry[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY];
  const totalFeesAccruedForThePeriodCurrency =
    dataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY] || dataEntry[UTILISATION_REPORT_HEADERS.BASE_CURRENCY];

  return FeeRecordEntity.create({
    facilityId: dataEntry[UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID],
    exporter: dataEntry[UTILISATION_REPORT_HEADERS.EXPORTER],
    baseCurrency: formatCurrencyUpperCase(dataEntry[UTILISATION_REPORT_HEADERS.BASE_CURRENCY]),
    facilityUtilisation: Number(dataEntry[UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION]),
    totalFeesAccruedForThePeriod: Number(dataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED]),
    totalFeesAccruedForThePeriodCurrency: formatCurrencyUpperCase(totalFeesAccruedForThePeriodCurrency),
    totalFeesAccruedForThePeriodExchangeRate: asNumberOrDefault(dataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE], 1),
    feesPaidToUkefForThePeriod,
    feesPaidToUkefForThePeriodCurrency: formatCurrencyUpperCase(dataEntry[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY]),
    paymentCurrency: formatCurrencyUpperCase(paymentCurrency),
    paymentExchangeRate: asNumberOrDefault(dataEntry[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE], 1),
    status,
    report,
    requestSource,
  });
};
