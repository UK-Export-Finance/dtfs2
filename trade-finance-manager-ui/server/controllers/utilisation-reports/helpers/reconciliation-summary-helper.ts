import { endOfDay, format, isPast, isSameMonth, parseISO } from 'date-fns';
import { UtilisationReportReconciliationStatus } from '@ukef/dtfs2-common';
import { UtilisationReportReconciliationSummary, UtilisationReportReconciliationSummaryItem } from '../../../types/utilisation-reports';
import { getReportDueDate, getReportPeriodStart } from '../../../services/utilisation-report-service';
import api from '../../../api';
import { IsoMonthStamp, MonthAndYear } from '../../../types/date';

type SummaryItemViewModel = UtilisationReportReconciliationSummaryItem & {
  displayStatus: string;
  formattedDateUploaded?: string;
  downloadPath?: string;
};

type ReportPeriodSummaryViewModel = {
  items: SummaryItemViewModel[];
  submissionMonth: IsoMonthStamp;
  reportPeriodStart: MonthAndYear;
  reportPeriodHeading: string;
  dueDateText: string;
};

type SummaryViewModel = ReportPeriodSummaryViewModel[];

const reconciliationStatusCodeToDisplayStatus: Record<UtilisationReportReconciliationStatus, string> = {
  REPORT_NOT_RECEIVED: 'Not received',
  PENDING_RECONCILIATION: 'Pending reconciliation',
  RECONCILIATION_IN_PROGRESS: 'Reconciliation in progress',
  RECONCILIATION_COMPLETED: 'Report completed',
};

const getSummaryItemViewModel = (apiItem: UtilisationReportReconciliationSummaryItem): SummaryItemViewModel => {
  const { status, dateUploaded, reportId } = apiItem;

  return {
    ...apiItem,
    displayStatus: reconciliationStatusCodeToDisplayStatus[status],
    formattedDateUploaded: dateUploaded ? format(parseISO(dateUploaded), 'd MMM yyyy') : undefined,
    downloadPath: status !== 'REPORT_NOT_RECEIVED' ? `/utilisation-reports/${reportId}/download` : undefined,
  };
};

export const getDueDateText = (reportDueDate: Date) => {
  const reportIsPastDue = isPast(endOfDay(reportDueDate));
  const formattedReportDueDate = format(reportDueDate, 'd MMMM yyyy');
  return `Reports${reportIsPastDue ? ' were ' : ' '}due to be received by ${formattedReportDueDate}.`;
};

export const getReportPeriodHeading = (submissionMonth: IsoMonthStamp, reportPeriodStart: MonthAndYear) => {
  const isCurrentSubmissionMonth = isSameMonth(new Date(submissionMonth), new Date());

  const reportPeriodStartDate = new Date(reportPeriodStart.year, reportPeriodStart.month - 1);
  const formattedReportPeriod = format(reportPeriodStartDate, 'MMM yyyy');

  return `${isCurrentSubmissionMonth ? 'Current reporting period' : 'Open reports'}: ${formattedReportPeriod}`;
};

const getBankHolidayDates = async (userToken: string): Promise<Date[]> => {
  const bankHolidays = await api.getUkBankHolidays(userToken);
  return bankHolidays['england-and-wales'].events.map((event) => new Date(event.date));
};

export const getReportReconciliationSummariesViewModel = async (
  summariesApiResponse: UtilisationReportReconciliationSummary[],
  userToken: string,
): Promise<SummaryViewModel> => {
  const bankHolidays = await getBankHolidayDates(userToken);

  return summariesApiResponse.map(({ items: apiItems, submissionMonth }) => {
    const reportDueDate = getReportDueDate(bankHolidays, submissionMonth);
    const reportPeriodStart = getReportPeriodStart(submissionMonth);

    return {
      items: apiItems.map(getSummaryItemViewModel),
      submissionMonth,
      reportPeriodStart,
      reportPeriodHeading: getReportPeriodHeading(submissionMonth, reportPeriodStart),
      dueDateText: getDueDateText(reportDueDate),
    };
  });
};
