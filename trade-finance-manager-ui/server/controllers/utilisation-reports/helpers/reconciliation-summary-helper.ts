import { endOfDay, format, isPast, isSameMonth, parseISO } from 'date-fns';
import { IsoMonthStamp, ReportPeriod, UtilisationReportReconciliationStatus, getFormattedReportPeriodWithShortMonth } from '@ukef/dtfs2-common';
import { UtilisationReportReconciliationSummary, UtilisationReportReconciliationSummaryItem } from '../../../types/utilisation-reports';
import { getReportDueDate } from '../../../services/utilisation-report-service';
import api from '../../../api';
import { UtilisationReportSummaryViewModel, ReportPeriodSummariesViewModel } from '../../../types/view-models';

export const reconciliationStatusCodeToDisplayStatus: Record<UtilisationReportReconciliationStatus, string> = {
  REPORT_NOT_RECEIVED: 'Not received',
  PENDING_RECONCILIATION: 'Pending reconciliation',
  RECONCILIATION_IN_PROGRESS: 'Reconciliation in progress',
  RECONCILIATION_COMPLETED: 'Report completed',
};

const getSummaryItemViewModel = (apiItem: UtilisationReportReconciliationSummaryItem): UtilisationReportSummaryViewModel => {
  const { status, dateUploaded, reportId } = apiItem;

  return {
    ...apiItem,
    displayStatus: reconciliationStatusCodeToDisplayStatus[status],
    formattedDateUploaded: dateUploaded ? format(parseISO(dateUploaded), 'd MMM yyyy') : undefined,
    downloadPath: status !== 'REPORT_NOT_RECEIVED' ? `/utilisation-reports/${reportId}/download` : undefined,
  };
};

const getDistinctReportPeriodsByStartMonth = (reportPeriods: ReportPeriod[]): ReportPeriod[] => {
  const yearMonthConcatenatedSet = new Set<number>();
  const distinctPeriods: ReportPeriod[] = [];
  reportPeriods.forEach((period) => {
    const yearMonthConcatenated = period.start.month + period.start.year * 100;
    if (!yearMonthConcatenatedSet.has(yearMonthConcatenated)) {
      yearMonthConcatenatedSet.add(yearMonthConcatenated);
      distinctPeriods.push(period);
    }
  });
  return distinctPeriods;
};

export const getDueDateText = (reportDueDate: Date) => {
  const reportIsPastDue = isPast(endOfDay(reportDueDate));
  const formattedReportDueDate = format(reportDueDate, 'd MMMM yyyy');
  return `Reports${reportIsPastDue ? ' were ' : ' '}due to be received by ${formattedReportDueDate}.`;
};

export const getReportPeriodHeading = (submissionMonth: IsoMonthStamp, reportPeriods: ReportPeriod[]) => {
  const isCurrentSubmissionMonth = isSameMonth(new Date(submissionMonth), new Date());

  const formattedReportPeriods = reportPeriods.map((reportPeriod) => getFormattedReportPeriodWithShortMonth(reportPeriod, true)).join(' and ');

  return `${isCurrentSubmissionMonth ? 'Current reporting period' : 'Open reports'}: ${formattedReportPeriods}`;
};

const getBankHolidayDates = async (userToken: string): Promise<Date[]> => {
  const bankHolidays = await api.getUkBankHolidays(userToken);
  return bankHolidays['england-and-wales'].events.map((event) => new Date(event.date));
};

export const getReportReconciliationSummariesViewModel = async (
  summariesApiResponse: UtilisationReportReconciliationSummary[],
  userToken: string,
): Promise<ReportPeriodSummariesViewModel> => {
  const bankHolidays = await getBankHolidayDates(userToken);

  return summariesApiResponse.map(({ items: apiItems, submissionMonth }) => {
    const reportDueDate = getReportDueDate(bankHolidays, submissionMonth);
    const distinctReportPeriods = getDistinctReportPeriodsByStartMonth(apiItems.map((item) => item.reportPeriod));

    return {
      items: apiItems.map(getSummaryItemViewModel),
      submissionMonth,
      reportPeriodHeading: getReportPeriodHeading(submissionMonth, distinctReportPeriods),
      dueDateText: getDueDateText(reportDueDate),
    };
  });
};
