import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import { Bank, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { IsoMonthStamp } from '../../../../types/date';
import { UtilisationReportReconciliationSummary, UtilisationReportReconciliationSummaryItem } from '../../../../types/utilisation-reports';
import { getAllBanks } from '../../../../repositories/banks-repo';
import { UtilisationDataRepo } from '../../../../repositories/utilisation-data-repo';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import {
  getCurrentReportPeriodForBankSchedule,
  getReportPeriodForBankScheduleBySubmissionMonth,
  getReportPeriodStartForSubmissionMonth,
  getSubmissionMonthForReportPeriodStart,
} from '../../../../utils/report-period';
import { isEqualMonthAndYear } from '../../../../utils/date';

type UtilisationReportForSubmissionMonth = {
  submissionMonth: IsoMonthStamp;
  report: UtilisationReportEntity;
};

type SummaryItemForSubmissionMonth = {
  submissionMonth: IsoMonthStamp;
  item: UtilisationReportReconciliationSummaryItem;
};

const mapToSummaryItem = async (bank: Bank, report: UtilisationReportEntity): Promise<UtilisationReportReconciliationSummaryItem> => {
  const reportData = await UtilisationDataRepo.findByReport(report);

  // TODO FN-1398 - status to be added to report data to allow us to calculate how
  //  many facilities are left to reconcile
  const reportedFeesLeftToReconcile = reportData.length;

  return {
    reportId: report.id,
    bank: {
      id: bank.id,
      name: bank.name,
    },
    status: report.status,
    dateUploaded: report.dateUploaded ?? undefined,
    totalFeesReported: reportData.length,
    reportedFeesLeftToReconcile,
  };
};

const mapToSummaryItemForSubmissionMonth = async (
  bank: Bank,
  { submissionMonth, report }: UtilisationReportForSubmissionMonth,
): Promise<SummaryItemForSubmissionMonth> => ({
  submissionMonth,
  item: await mapToSummaryItem(bank, report),
});

const mapToSubmissionMonth = (reports: UtilisationReportEntity[]): UtilisationReportForSubmissionMonth[] => {
  const reportsOrderedByReportPeriodStartAscending = orderBy(reports, ['reportPeriod.start.year', 'reportPeriod.start.month'], ['asc', 'asc']);

  return reportsOrderedByReportPeriodStartAscending.map((report) => {
    const submissionMonth = getSubmissionMonthForReportPeriodStart(report.reportPeriod.start);
    return { submissionMonth, report };
  });
};

const getPreviousOpenReportsForBank = async (bank: Bank, currentSubmissionMonth: IsoMonthStamp): Promise<SummaryItemForSubmissionMonth[]> => {
  const currentReportPeriodStart = getReportPeriodStartForSubmissionMonth(currentSubmissionMonth);

  const openReportsBeforeCurrentReportPeriod = await UtilisationReportRepo.findOpenReportsBeforeReportPeriodStartForBankId(bank.id, currentReportPeriodStart);

  if (!openReportsBeforeCurrentReportPeriod.length) {
    return [];
  }

  const reportsMappedToSubmissionMonth: UtilisationReportForSubmissionMonth[] = mapToSubmissionMonth(openReportsBeforeCurrentReportPeriod);

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
  const reportPeriod = getReportPeriodForBankScheduleBySubmissionMonth(bank.utilisationReportPeriodSchedule, submissionMonth);
  const report = await UtilisationReportRepo.findOneByBankIdAndReportPeriod(bank.id, reportPeriod);
  if (!report) {
    throw new Error(`Failed to get report for bank with id ${bank.id} for submission month ${submissionMonth}`);
  }
  return await mapToSummaryItem(bank, report);
};

export const getAllReportsForSubmissionMonth = async (banks: Bank[], submissionMonth: IsoMonthStamp): Promise<UtilisationReportReconciliationSummary> => ({
  submissionMonth,
  items: await Promise.all(banks.map((bank) => getCurrentReconciliationSummaryItem(bank, submissionMonth))),
});

const isBankDueToSubmitReport =
  (currentSubmissionMonth: IsoMonthStamp) =>
  (bank: Bank): boolean => {
    const currentReportPeriodForBank = getCurrentReportPeriodForBankSchedule(bank.utilisationReportPeriodSchedule);
    return isEqualMonthAndYear(currentReportPeriodForBank.start, getReportPeriodStartForSubmissionMonth(currentSubmissionMonth));
  };

export const generateReconciliationSummaries = async (currentSubmissionMonth: IsoMonthStamp): Promise<UtilisationReportReconciliationSummary[]> => {
  const banksVisibleInTfm = (await getAllBanks()).filter((bank) => bank.isVisibleInTfmUtilisationReports);

  const banksDueToSubmit = banksVisibleInTfm.filter(isBankDueToSubmitReport(currentSubmissionMonth));
  const allReportsForCurrentSubmissionMonth = await getAllReportsForSubmissionMonth(banksDueToSubmit, currentSubmissionMonth);

  const openReportsForPreviousSubmissionMonths = await getPreviousOpenReportsBySubmissionMonth(banksVisibleInTfm, currentSubmissionMonth);

  return [allReportsForCurrentSubmissionMonth, ...openReportsForPreviousSubmissionMonths];
};
