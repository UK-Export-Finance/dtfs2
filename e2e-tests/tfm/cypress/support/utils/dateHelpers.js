import { format, subMonths } from 'date-fns';

/**
 * Gets the one indexed month
 * @param {Date} dateInMonth - A date in the month
 * @returns {number} The one indexed month
 */
const getOneIndexedMonth = (dateInMonth) => dateInMonth.getMonth() + 1;

/**
 * Converts the supplied date to an ISO month stamp
 * @param {Date} date - A date in the submission month
 * @returns {string} The current month as an ISO month stamp
 */
export const toIsoMonthStamp = (date) => format(date, 'yyyy-MM');

/**
 * Gets the monthly report period from the submission month
 * @param {string} submissionMonth - The submission month as an ISO month stamp
 * @returns {{ start: { month: number, year, number }, end: { month: number, year, number } }}
 */
export const getMonthlyReportPeriodFromIsoSubmissionMonth = (submissionMonth) => {
  const reportPeriodDate = subMonths(new Date(submissionMonth), 1);
  const reportPeriodMonthAndYear = {
    month: getOneIndexedMonth(reportPeriodDate),
    year: reportPeriodDate.getFullYear(),
  };
  return { start: reportPeriodMonthAndYear, end: reportPeriodMonthAndYear };
};
