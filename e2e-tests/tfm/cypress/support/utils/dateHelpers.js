import { subMonths } from 'date-fns';
import { getOneIndexedMonth } from '@ukef/dtfs2-common';

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
