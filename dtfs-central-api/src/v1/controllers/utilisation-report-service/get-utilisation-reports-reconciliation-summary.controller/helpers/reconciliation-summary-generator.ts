import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import {
  getCurrentReportPeriodForBankSchedule,
  getPreviousReportPeriodForBankScheduleByMonth,
  getReportPeriodEndForSubmissionMonth,
  getSubmissionMonthForReportPeriod,
  isEqualMonthAndYear,
  Bank,
  UtilisationReportEntity,
  IsoMonthStamp,
} from '@ukef/dtfs2-common';
import { UtilisationReportReconciliationSummary, UtilisationReportReconciliationSummaryItem } from '../../../../../types/utilisation-reports';
import { UtilisationReportRepo } from '../../../../../repositories/utilisation-reports-repo';
import { getAllBanks } from '../../../../../repositories/banks-repo';
import { mapReportToSummaryItem } from './reconciliation-summary-item-mapper';

type UtilisationReportForSubmissionMonth = {
  submissionMonth: IsoMonthStamp;
  report: UtilisationReportEntity;
};

type SummaryItemForSubmissionMonth = {
  submissionMonth: IsoMonthStamp;
  item: UtilisationReportReconciliationSummaryItem;
};

const mapToSummaryItemForSubmissionMonth = (bank: Bank, { submissionMonth, report }: UtilisationReportForSubmissionMonth): SummaryItemForSubmissionMonth => ({
  submissionMonth,
  item: mapReportToSummaryItem(bank, report),
});

const mapToSubmissionMonth = (reports: UtilisationReportEntity[]): UtilisationReportForSubmissionMonth[] => {
  const reportsOrderedByReportPeriodEndAscending = orderBy(reports, ['reportPeriod.end.year', 'reportPeriod.end.month'], ['asc', 'asc']);

  return reportsOrderedByReportPeriodEndAscending.map((report) => {
    const submissionMonth = getSubmissionMonthForReportPeriod(report.reportPeriod);
    return { submissionMonth, report };
  });
};

const getPreviousOpenReportsForBank = async (bank: Bank, currentSubmissionMonth: IsoMonthStamp): Promise<SummaryItemForSubmissionMonth[]> => {
  const currentReportPeriodEnd = getReportPeriodEndForSubmissionMonth(currentSubmissionMonth);

  const openReportsBeforeCurrentReportPeriod = await UtilisationReportRepo.findOpenReportsForBankIdWithReportPeriodEndBefore(
    bank.id,
    currentReportPeriodEnd,
    true,
  );

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
  const reportPeriod = getPreviousReportPeriodForBankScheduleByMonth(bank.utilisationReportPeriodSchedule, submissionMonth);
  const report = await UtilisationReportRepo.findOneByBankIdAndReportPeriod(bank.id, reportPeriod, true);
  if (!report) {
    throw new Error(`Failed to get report for bank with id ${bank.id} for submission month ${submissionMonth}`);
  }
  return mapReportToSummaryItem(bank, report);
};

export const getAllReportsForSubmissionMonth = async (banks: Bank[], submissionMonth: IsoMonthStamp): Promise<UtilisationReportReconciliationSummary> => ({
  submissionMonth,
  items: await Promise.all(banks.map((bank) => getCurrentReconciliationSummaryItem(bank, submissionMonth))),
});

const isBankDueToSubmitReport =
  (currentSubmissionMonth: IsoMonthStamp) =>
  (bank: Bank): boolean => {
    const currentReportPeriodForBank = getCurrentReportPeriodForBankSchedule(bank.utilisationReportPeriodSchedule);
    return isEqualMonthAndYear(currentReportPeriodForBank.end, getReportPeriodEndForSubmissionMonth(currentSubmissionMonth));
  };

export const generateReconciliationSummaries = async (currentSubmissionMonth: IsoMonthStamp): Promise<UtilisationReportReconciliationSummary[]> => {
  const banksVisibleInTfm = (await getAllBanks()).filter((bank) => bank.isVisibleInTfmUtilisationReports);

  const banksDueToSubmit = banksVisibleInTfm.filter(isBankDueToSubmitReport(currentSubmissionMonth));
  const allReportsForCurrentSubmissionMonth = await getAllReportsForSubmissionMonth(banksDueToSubmit, currentSubmissionMonth);

  const openReportsForPreviousSubmissionMonths = await getPreviousOpenReportsBySubmissionMonth(banksVisibleInTfm, currentSubmissionMonth);

  return [allReportsForCurrentSubmissionMonth, ...openReportsForPreviousSubmissionMonths];
};
