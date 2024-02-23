import { DbRequestSource, UtilisationDataEntity } from '@ukef/dtfs2-common';
import { UtilisationReportRawCsvData } from '../types/utilisation-reports';
import { UTILISATION_REPORT_HEADERS } from '../constants';

type UtilisationDataCsvRowToSqlEntityParams = {
  dataEntry: UtilisationReportRawCsvData;
  requestSource: DbRequestSource;
};

const asNumberOrDefault = (maybeString: string | undefined, defaultNumber: number) => (maybeString ? Number(maybeString) : defaultNumber);

export const utilisationDataCsvRowToSqlEntity = ({ dataEntry, requestSource }: UtilisationDataCsvRowToSqlEntityParams): UtilisationDataEntity =>
  UtilisationDataEntity.create({
    facilityId: dataEntry[UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID],
    exporter: dataEntry[UTILISATION_REPORT_HEADERS.EXPORTER],
    baseCurrency: dataEntry[UTILISATION_REPORT_HEADERS.BASE_CURRENCY],
    facilityUtilisation: Number(dataEntry[UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION]),
    totalFeesAccruedForTheMonth: Number(dataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED]),
    totalFeesAccruedForTheMonthCurrency: dataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY],
    totalFeesAccruedForTheMonthExchangeRate: asNumberOrDefault(dataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE], 1),
    monthlyFeesPaidToUkef: Number(dataEntry[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD]),
    monthlyFeesPaidToUkefCurrency: dataEntry[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY],
    paymentCurrency: dataEntry[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY],
    paymentExchangeRate: asNumberOrDefault(dataEntry[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE], 1),
    requestSource,
  });
