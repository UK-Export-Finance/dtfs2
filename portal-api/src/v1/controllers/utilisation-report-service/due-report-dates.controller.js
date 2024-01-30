const {
  subMonths,
  isSameMonth,
  getMonth,
  getYear,
  eachMonthOfInterval,
  addMonths,
} = require('date-fns');
const api = require('../../api');

const isCurrentReportSubmitted = (latestReport, currentDueReportDate) => {
  if (!latestReport) {
    return false;
  }
  const { month, year } = latestReport;
  const lastSubmittedReportDate = new Date(year, month - 1);
  return isSameMonth(currentDueReportDate, lastSubmittedReportDate);
};

/**
 * Gets the next due report date given the most recent report. If the most
 * recent report is empty, it will return the current report period date.
 * @param {Object} latestReport - object containing details about the latest report
 * @param {Date} currentDueReportDate - date object of the current report period due report
 * @returns {Date} - date object for the next due report
 */
const getNextDueReportDate = (latestReport, currentDueReportDate) => {
  if (!latestReport) {
    return currentDueReportDate;
  }

  const { month: oneIndexedMonth, year } = latestReport;
  const latestReportDate = new Date(year, oneIndexedMonth - 1);
  return addMonths(latestReportDate, 1);
};

/**
 * @typedef {Object} DueReportDate
 * @property {number} year - The report period year for the due report
 * @property {number} month - The one-indexed report period month for the due report
 */

/**
 * Generates an array of due report dates containing the month and year by
 * checking the report period of the latest report and comparing that to
 * the current report period (the month preceding the current month). If
 * the most recent report is empty, it is assumed that the report for the
 * current report period is due and therefore that is returned. If the reports
 * are up to date, an empty array is returned.
 * @param {Object} latestReport - object containing details about the latest report
 * @returns {DueReportDate[]}
 */
const getDueReportDatesList = (latestReport) => {
  const currentDate = new Date();
  const currentDueReportDate = subMonths(currentDate, 1);
  if (isCurrentReportSubmitted(latestReport, currentDueReportDate)) {
    return [];
  }

  const nextDueReportDate = getNextDueReportDate(latestReport, currentDueReportDate);
  const dueReportDates = eachMonthOfInterval({
    start: nextDueReportDate,
    end: currentDueReportDate,
  });
  return dueReportDates.map((dueReportDate) => {
    const year = getYear(dueReportDate);
    const oneIndexedMonth = getMonth(dueReportDate) + 1;
    return { month: oneIndexedMonth, year };
  });
};

/**
 * Calls the DTFS Central API to get a banks uploaded utilisation reports and
 * returns the due reports based on the reporting period of that report, where
 * the month of the due report is a one-indexed number and the year is a number
 */
const getDueReportDates = async (req, res) => {
  try {
    const { bankId } = req.params;

    const reports = await api.getUtilisationReports(bankId);
    const latestReport = reports.at(-1); // utilisation reports are sorted by central api
    const dueReportDates = getDueReportDatesList(latestReport);

    return res.status(200).send(dueReportDates);
  } catch (error) {
    console.error('Cannot get due reports %s', error);
    return res.status(error.response?.status ?? 500).send({ message: 'Failed to get due reports' });
  }
};

module.exports = {
  isCurrentReportSubmitted,
  getNextDueReportDate,
  getDueReportDatesList,
  getDueReportDates,
};
