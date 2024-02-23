import { OptionalId } from 'mongodb';
import { ReportPeriod } from '@ukef/dtfs2-common';
import db from '../drivers/db-client';
import { SessionBank } from '../types/session-bank';
import { UtilisationData } from '../types/db-models/utilisation-data';
import { UtilisationReport } from '../types/db-models/utilisation-reports';
import { UtilisationReportRawCsvData } from '../types/utilisation-reports';
import { DB_COLLECTIONS, UTILISATION_REPORT_HEADERS } from '../constants';

export const saveUtilisationData = async (reportData: UtilisationReportRawCsvData[], reportPeriod: ReportPeriod, bank: SessionBank, reportId: string) => {
  const utilisationDataObjects = reportData.map(
    (reportDataEntry): OptionalId<UtilisationData> => ({
      facilityId: reportDataEntry[UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID],
      reportId,
      bankId: bank.id,
      reportPeriod,
      exporter: reportDataEntry[UTILISATION_REPORT_HEADERS.EXPORTER],
      baseCurrency: reportDataEntry[UTILISATION_REPORT_HEADERS.BASE_CURRENCY],
      facilityUtilisation: Number(reportDataEntry[UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION]),
      totalFeesAccruedForTheMonth: Number(reportDataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED]),
      totalFeesAccruedForTheMonthCurrency: reportDataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY],
      totalFeesAccruedForTheMonthExchangeRate: reportDataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]
        ? Number(reportDataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE])
        : 1,
      monthlyFeesPaidToUkef: Number(reportDataEntry[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD]),
      monthlyFeesPaidToUkefCurrency: reportDataEntry[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY],
      paymentCurrency: reportDataEntry[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY],
      paymentExchangeRate: reportDataEntry[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]
        ? Number(reportDataEntry[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE])
        : 1,
      payments: null,
    }),
  );

  const utilisationDataCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_DATA);
  await utilisationDataCollection.insertMany(utilisationDataObjects);
};

export const getAllUtilisationDataForReport = async ({ _id: reportId, reportPeriod }: UtilisationReport): Promise<UtilisationData[]> => {
  const utilisationDataCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_DATA);
  return await utilisationDataCollection.find({
    reportId: { $eq: reportId.toString() },
    'reportPeriod.start.month': { $eq: reportPeriod.start.month },
    'reportPeriod.start.year': { $eq: reportPeriod.start.year }
  }).toArray();
};
