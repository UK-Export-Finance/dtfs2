import {
  DbRequestSource,
  FeeRecordEntity,
  UtilisationReportEntity,
  UTILISATION_REPORT_HEADERS,
} from '@ukef/dtfs2-common';
import { UtilisationReportRawCsvData } from '../types/utilisation-reports';

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
const asNumberOrDefault = (maybeString: string | undefined, defaultNumber: number) =>
  maybeString ? Number(maybeString) : defaultNumber;

/**
 * Converts a csv data row to the SQL entity
 * @param param0 - The parameters required to create the SQL entity
 * @returns The SQL entity
 */
export const feeRecordCsvRowToSqlEntity = ({
  dataEntry,
  requestSource,
  report,
}: FeeRecordCsvRowToSqlEntityParams): FeeRecordEntity =>
  FeeRecordEntity.create({
    facilityId: dataEntry[UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID],
    exporter: dataEntry[UTILISATION_REPORT_HEADERS.EXPORTER],
    baseCurrency: dataEntry[UTILISATION_REPORT_HEADERS.BASE_CURRENCY],
    facilityUtilisation: Number(dataEntry[UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION]),
    totalFeesAccruedForThePeriod: Number(dataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED]),
    totalFeesAccruedForThePeriodCurrency:
      dataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY] ??
      dataEntry[UTILISATION_REPORT_HEADERS.BASE_CURRENCY],
    totalFeesAccruedForThePeriodExchangeRate: asNumberOrDefault(
      dataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE],
      1,
    ),
    feesPaidToUkefForThePeriod: Number(dataEntry[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD]),
    feesPaidToUkefForThePeriodCurrency: dataEntry[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY],
    paymentCurrency:
      dataEntry[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY] ??
      dataEntry[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY],
    paymentExchangeRate: asNumberOrDefault(dataEntry[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE], 1),
    status: 'TO_DO',
    report,
    requestSource,
  });
