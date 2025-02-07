import { endOfDay, format, isPast, isSameMonth, parseISO, subMonths } from 'date-fns';
import { IsoMonthStamp, REPORT_NOT_RECEIVED, ReportPeriod, UtilisationReportStatus, isEqualMonthAndYear } from '@ukef/dtfs2-common';
import { UtilisationReportReconciliationSummary, UtilisationReportReconciliationSummaryItem } from '../../../types/utilisation-reports';
import { getReportDueDate } from '../../../services/utilisation-report-service';
import api from '../../../api';
import { UtilisationReportSummaryViewModel, ReportPeriodSummariesViewModel } from '../../../types/view-models';
import { UtilisationReportDisplayFrequency } from '../../../types/utilisation-report-display-frequency';
import { BANK_REPORTS_FOR_PERIOD_TABLE_HEADER_PREFIX, UTILISATION_REPORT_DISPLAY_FREQUENCY } from '../../../constants';

export const reconciliationStatusCodeToDisplayStatus: Record<UtilisationReportStatus, string> = {
  REPORT_NOT_RECEIVED: 'Not received',
  PENDING_RECONCILIATION: 'Pending reconciliation',
  RECONCILIATION_IN_PROGRESS: 'Reconciliation in progress',
  RECONCILIATION_COMPLETED: 'Report completed',
};

/**
 * Get the display frequency for the report period
 * @param reportPeriod - The report period
 * @returns The display frequency
 */
const getUtilisationReportDisplayFrequency = (reportPeriod: ReportPeriod): UtilisationReportDisplayFrequency => {
  return isEqualMonthAndYear(reportPeriod.start, reportPeriod.end)
    ? UTILISATION_REPORT_DISPLAY_FREQUENCY.MONTHLY
    : UTILISATION_REPORT_DISPLAY_FREQUENCY.QUARTERLY;
};

/**
 * Get the summary item view model from the api summary item
 * @param apiItem - The api summary item
 * @returns The summary item view model
 */
const getSummaryItemViewModel = (apiItem: UtilisationReportReconciliationSummaryItem): UtilisationReportSummaryViewModel => {
  const { status, dateUploaded, reportId, reportPeriod } = apiItem;

  return {
    ...apiItem,
    frequency: getUtilisationReportDisplayFrequency(reportPeriod),
    displayStatus: reconciliationStatusCodeToDisplayStatus[status],
    formattedDateUploaded: dateUploaded ? format(parseISO(dateUploaded), 'd MMM yyyy') : undefined,
    downloadPath: status !== REPORT_NOT_RECEIVED ? `/utilisation-reports/${reportId}/download` : undefined,
  };
};

/**
 * Get the report due date text for the given report due date
 * @param reportDueDate - The report due date
 * @returns The due date text
 */
export const getDueDateText = (reportDueDate: Date) => {
  const reportIsPastDue = isPast(endOfDay(reportDueDate));
  const formattedReportDueDate = format(reportDueDate, 'd MMMM yyyy');
  return `Reports${reportIsPastDue ? ' were ' : ' '}due to be received by ${formattedReportDueDate}.`;
};

/**
 * Get report period heading with report period end
 * @param submissionMonth - The submission month
 * @returns Report period heading with the report period end
 */
export const getReportPeriodHeading = (submissionMonth: IsoMonthStamp) => {
  const submissionMonthDate = new Date(submissionMonth);
  const isCurrentSubmissionMonth = isSameMonth(submissionMonthDate, new Date());

  const reportPeriodEnd = subMonths(submissionMonthDate, 1);
  const formattedReportPeriodEnd = format(reportPeriodEnd, 'MMMM yyyy');

  return `${
    isCurrentSubmissionMonth ? BANK_REPORTS_FOR_PERIOD_TABLE_HEADER_PREFIX.CURRENT_PERIOD_END : BANK_REPORTS_FOR_PERIOD_TABLE_HEADER_PREFIX.OPEN_PERIOD_END
  }: ${formattedReportPeriodEnd}`;
};

/**
 * Get bank holiday dates
 * @param userToken - The user token
 * @returns The dates of the bank holidays
 */
const getBankHolidayDates = async (userToken: string): Promise<Date[]> => {
  const bankHolidays = await api.getUkBankHolidays(userToken);
  return bankHolidays['england-and-wales'].events.map((event) => new Date(event.date));
};

/**
 * Maps api response to report reconciliation summaries view model
 * @param summariesApiResponse - the api response containing the report summaries
 * @param userToken - the user token
 * @returns - report period summaries view model
 */
export const getReportReconciliationSummariesViewModel = async (
  summariesApiResponse: UtilisationReportReconciliationSummary[],
  userToken: string,
): Promise<ReportPeriodSummariesViewModel> => {
  const bankHolidays = await getBankHolidayDates(userToken);

  return summariesApiResponse.map(({ items: apiItems, submissionMonth }) => {
    const reportDueDate = getReportDueDate(bankHolidays, submissionMonth);

    return {
      items: apiItems.map(getSummaryItemViewModel),
      submissionMonth,
      reportPeriodHeading: getReportPeriodHeading(submissionMonth),
      dueDateText: getDueDateText(reportDueDate),
    };
  });
};
