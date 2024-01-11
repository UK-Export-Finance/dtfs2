import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import { eachIsoMonthOfInterval } from '../../../../utils/date';
import { Bank } from '../../../../types/db-models/banks';
import { IsoMonthStamp } from '../../../../types/date';
import { UtilisationReportReconciliationSummary, UtilisationReportReconciliationSummaryItem } from '../../../../types/utilisation-reports';
import { UtilisationReport } from '../../../../types/db-models/utilisation-reports';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../../constants';
import { getAllBanks } from '../../../../services/repositories/banks-repo';
import { getAllUtilisationDataForReport } from '../../../../services/repositories/utilisation-data-repo';
import {
  getUtilisationReportDetailsByBankIdMonthAndYear,
  getOpenReportsBeforeReportPeriodForBankId,
} from '../../../../services/repositories/utilisation-reports-repo';
import {
  getPreviousReportPeriodStart,
  getReportPeriodStartForSubmissionMonth,
  getReportPeriodStartForUtilisationReport,
  getSubmissionMonthForReportPeriodStart,
  isEqualReportPeriodStart,
} from '../../../../utils/report-period';

type UtilisationReportForSubmissionMonth = {
  submissionMonth: IsoMonthStamp;
  report: UtilisationReport | null;
};

type SummaryItemForSubmissionMonth = {
  submissionMonth: IsoMonthStamp;
  item: UtilisationReportReconciliationSummaryItem;
};

const mapToSummaryItem = async (bank: Bank, report: UtilisationReport | null): Promise<UtilisationReportReconciliationSummaryItem> => {
  // TODO FN-1949 - Use actual REPORT_NOT_RECEIVED UtilisationReport when added by job. Throw errors when null.
  if (!report) {
    return {
      bank: {
        id: bank.id,
        name: bank.name,
      },
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
    };
  }

  const reportData = await getAllUtilisationDataForReport(report);

  // TODO FN-1398 - status to be added to report data to allow us to calculate how
  //  many facilities are left to reconcile
  const reportedFeesLeftToReconcile = reportData.length;

  return {
    reportId: report._id,
    bank: {
      id: bank.id,
      name: bank.name,
    },
    status: report.status,
    dateUploaded: report.dateUploaded,
    totalFeesReported: reportData.length,
    reportedFeesLeftToReconcile,
    isPlaceholderReport: report.azureFileInfo === null,
  };
};

const mapToSummaryItemForSubmissionMonth = async (
  bank: Bank,
  { submissionMonth, report }: UtilisationReportForSubmissionMonth,
): Promise<SummaryItemForSubmissionMonth> => ({
  submissionMonth,
  item: await mapToSummaryItem(bank, report),
});

const generateMissingReports = ({ from, to }: { from: IsoMonthStamp; to: IsoMonthStamp }): UtilisationReportForSubmissionMonth[] => {
  const missingSubmissionMonths = eachIsoMonthOfInterval(from, to, {
    exclusive: true,
  });

  return missingSubmissionMonths.map((submissionMonth) => ({
    submissionMonth,
    report: null,
  }));
};

const addNotReceivedReportsAndMapToSubmissionMonth = (
  reports: UtilisationReport[],
  currentSubmissionMonth: IsoMonthStamp,
): UtilisationReportForSubmissionMonth[] => {
  const currentReportPeriodStart = getReportPeriodStartForSubmissionMonth(currentSubmissionMonth);
  const previousReportPeriodStart = getPreviousReportPeriodStart(currentReportPeriodStart);

  const reportsOrderedByReportPeriodStartAscending = orderBy(reports, ['year', 'month'], ['asc', 'asc']);

  const updatedReportsWithSubmissionMonth = reportsOrderedByReportPeriodStartAscending.map((report) => {
    const reportPeriodStart = getReportPeriodStartForUtilisationReport(report);
    const submissionMonth = getSubmissionMonthForReportPeriodStart(reportPeriodStart);
    return { submissionMonth, report };
  });

  // TODO FN-1949 - when REPORT_NOT_RECEIVED reports are added by a job we can
  //  just return `updatedReportsWithSubmissionMonth` here.

  const mostRecentOpenReport = reportsOrderedByReportPeriodStartAscending.at(-1);

  if (!mostRecentOpenReport || isEqualReportPeriodStart(getReportPeriodStartForUtilisationReport(mostRecentOpenReport), previousReportPeriodStart)) {
    return updatedReportsWithSubmissionMonth;
  }

  const missingReports = generateMissingReports({
    from: getSubmissionMonthForReportPeriodStart(mostRecentOpenReport.reportPeriod.start),
    to: currentSubmissionMonth,
  });
  return [...updatedReportsWithSubmissionMonth, ...missingReports];
};

const getPreviousOpenReportsForBank = async (bank: Bank, currentSubmissionMonth: IsoMonthStamp): Promise<SummaryItemForSubmissionMonth[]> => {
  const currentReportPeriodStart = getReportPeriodStartForSubmissionMonth(currentSubmissionMonth);

  const openReportsBeforeCurrentReportPeriod = await getOpenReportsBeforeReportPeriodForBankId(currentReportPeriodStart, bank.id);

  if (!openReportsBeforeCurrentReportPeriod.length) {
    return [];
  }

  const reportsMappedToSubmissionMonth: UtilisationReportForSubmissionMonth[] = addNotReceivedReportsAndMapToSubmissionMonth(
    openReportsBeforeCurrentReportPeriod,
    currentSubmissionMonth,
  );

  return await Promise.all(reportsMappedToSubmissionMonth.map((report) => mapToSummaryItemForSubmissionMonth(bank, report)));
};

export const getPreviousOpenReportsBySubmissionMonth = async (
  banks: Bank[],
  currentSubmissionMonth: IsoMonthStamp,
): Promise<UtilisationReportReconciliationSummary[]> => {
  const allPreviousOpenReports = (await Promise.all(banks.map((bank) => getPreviousOpenReportsForBank(bank, currentSubmissionMonth)))).flat();

  const orderedPreviousOpenReports = orderBy(allPreviousOpenReports, ['submissionMonth', 'item.bank.name'], ['desc', 'asc']);
  const previousOpenReportsBySubmissionMonth = groupBy(orderedPreviousOpenReports, ({ submissionMonth }) => submissionMonth);

  return Object.entries(previousOpenReportsBySubmissionMonth).map(([submissionMonth, itemsForSubmissionMonth]) => ({
    submissionMonth,
    items: itemsForSubmissionMonth.map(({ item }) => item),
  }));
};

const getCurrentReconciliationSummaryItem = async (bank: Bank, submissionMonth: IsoMonthStamp): Promise<UtilisationReportReconciliationSummaryItem> => {
  const { month, year } = getReportPeriodStartForSubmissionMonth(submissionMonth);
  const report = await getUtilisationReportDetailsByBankIdMonthAndYear(bank.id, month, year);
  return await mapToSummaryItem(bank, report);
};

export const getAllReportsForSubmissionMonth = async (banks: Bank[], submissionMonth: IsoMonthStamp): Promise<UtilisationReportReconciliationSummary> => ({
  submissionMonth,
  items: await Promise.all(banks.map((bank) => getCurrentReconciliationSummaryItem(bank, submissionMonth))),
});

export const generateReconciliationSummaries = async (currentSubmissionMonth: IsoMonthStamp): Promise<UtilisationReportReconciliationSummary[]> => {
  // TODO FN-1949 - when banks' reporting schedules are added to the `bank` collection, add new repo method to only
  //  fetch banks that are due to submit this month
  const banks = await getAllBanks();

  const allReportsForCurrentSubmissionMonth = await getAllReportsForSubmissionMonth(banks, currentSubmissionMonth);
  const openReportsForPreviousSubmissionMonths = await getPreviousOpenReportsBySubmissionMonth(banks, currentSubmissionMonth);

  return [allReportsForCurrentSubmissionMonth, ...openReportsForPreviousSubmissionMonths];
};
