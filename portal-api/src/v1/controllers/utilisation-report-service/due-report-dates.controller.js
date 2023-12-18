const {
  subMonths,
  isSameMonth,
  getMonth,
  getYear,
  eachMonthOfInterval,
  addMonths,
} = require('date-fns');
const { REPORT_FREQUENCY } = require('../../../constants');
const api = require('../../api');
const { eachThreeMonthsOfInterval } = require('../../helpers/eachThreeMonthsOfInterval');
const { getReportFrequencyFromBank } = require('./utilisation-report-upload.controller');

const isCurrentReportSubmitted = (latestReport, currentDueReportDate) => {
  if (!latestReport) {
    return false;
  }
  const { month, year } = latestReport;
  const lastSubmittedReportDate = new Date(year, month - 1);
  return isSameMonth(currentDueReportDate, lastSubmittedReportDate);
};

/**
 * Gets the next due report date given the most recent report. If the latest
 * report is empty, it will return the current report period date.
 * @param {Object} latestReport - object containing details about the latest report
 * @param {Date} currentDueReportDate - date object of the current report period due report
 * @param {string} reportFrequency - frequency that bank reports, monthly or quarterly
 * @returns {Date} - date object for the next due report
 */
const getNextDueReportDate = (latestReport, currentDueReportDate, reportFrequency) => {
  if (!latestReport) {
    return currentDueReportDate;
  }

  const { month: oneIndexedMonth, year } = latestReport;
  const latestReportDate = new Date(year, oneIndexedMonth - 1);

  if (reportFrequency === REPORT_FREQUENCY.QUARTERLY) {
    return addMonths(latestReportDate, 3);
  };
  return addMonths(latestReportDate, 1);
};

/**
 * 
 * @param {string} reportFrequency - monthly or quarterly
 * @returns {Date} 
 */
const getCurrentDueReportDate = (reportFrequency) => {
  const currentDate = new Date();
  if (reportFrequency === REPORT_FREQUENCY.QUARTERLY) {
    const currentMonth = getMonth(currentDate);
    if (currentMonth === 0 || currentMonth === 3 || currentMonth === 6 || currentMonth === 9) {
      return subMonths(currentDate, 4);
    };
    if (currentMonth === 1 || currentMonth === 4 || currentMonth === 7 || currentMonth === 10) {
      return subMonths(currentDate, 5);
    };
    return subMonths(currentDate, 3);
  };
  return subMonths(currentDate, 1);
};

/**
 * @typedef {Object} DueReportDate
 * @property {number} year - The report period year for the due report
 * @property {number} month - The one-indexed report period month for the due report
 */

/**
 * Generates an array of due report dates containing the month and year by
 * checking the reports submitted already and report frequency. If the most 
 * recent report is empty, it is assumed that the report for the current 
 * report period is due. If the reports are up to date, an empty array is returned.
 * @param {Object} latestReport - object containing details about the latest report
 * @param {string} reportFrequency - frequency that bank reports, monthly or quarterly
 * @returns {DueReportDate[]}
 */
const getDueReportDatesList = (latestReport, reportFrequency) => {
  const currentDueReportDate = getCurrentDueReportDate(reportFrequency);
  if (isCurrentReportSubmitted(latestReport, currentDueReportDate)) {
    return [];
  }

  const nextDueReportDate = getNextDueReportDate(latestReport, currentDueReportDate, reportFrequency);
  const dueReportDates = reportFrequency === REPORT_FREQUENCY.QUARTERLY
    ? eachThreeMonthsOfInterval({
      start: nextDueReportDate,
      end: currentDueReportDate,
    })
    : eachMonthOfInterval({
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
    const reportFrequency = await getReportFrequencyFromBank(bankId);

    const latestReport = reports.at(-1); // utilisation reports are sorted by central api
    const dueReportDates = getDueReportDatesList(latestReport, reportFrequency);

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
