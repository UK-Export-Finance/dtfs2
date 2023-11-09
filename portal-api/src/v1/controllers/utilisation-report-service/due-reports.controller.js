const { subMonths, isSameMonth, addMonths, format, getMonth, getYear } = require('date-fns');
const api = require('../../api');

const isCurrentReportSubmitted = (mostRecentReport, currentDueReportDate) => {
  if (!mostRecentReport) {
    return false;
  }
  const { month, year } = mostRecentReport;
  const lastSubmittedReportDate = new Date(year, month - 1);
  return isSameMonth(currentDueReportDate, lastSubmittedReportDate);
};

/**
 * Generates an array of due report dates containing the month and year by
 * checking the report period of the last submitted report and comparing that
 * to the current report period (the month preceding the current month). If
 * the most recent report is empty, it is assumed that the report for the
 * current report period is due and therefore that is returned. If the reports
 * are up to date, an empty array is returned.
 * @param {Object} mostRecentReport - object containing details about the last submitted report
 * @returns {Array} dueReportDates - due report month (number, one-indexed) and year (number)
 */
const getDueReportDates = (mostRecentReport) => {
  const currentDate = new Date();
  const currentDueReportDate = subMonths(currentDate, 1);
  if (isCurrentReportSubmitted(mostRecentReport, currentDueReportDate)) {
    return [];
  }

  const nextDueReportYear = mostRecentReport.year ?? getYear(currentDueReportDate);
  const nextDueReportMonth = mostRecentReport.month ?? getMonth(currentDueReportDate);
  const nextDueReportDate = new Date(nextDueReportYear, nextDueReportMonth);

  const dueReportDates = [];
  while (!isSameMonth(nextDueReportDate, currentDueReportDate)) {
    const year = format(nextDueReportDate, 'yyyy');
    const month = getMonth(nextDueReportDate);
    dueReportDates.push({ year, month });
    addMonths(nextDueReportDate, 1);
  }
  const year = format(currentDueReportDate, 'yyyy');
  const month = getMonth(currentDueReportDate);
  dueReportDates.push({ year, month });
  return dueReportDates;
};

/**
 * Calls the DTFS Central API to get a banks uploaded utilisation reports and
 * returns the due reports based on the reporting period of that report, where
 * the month of the due report is a one-indexed number and the year is a number
 */
const getDueReports = async (req, res) => {
  try {
    const { bankId } = req.params;

    const { data } = await api.getUtilisationReports(bankId);
    const mostRecentReport = data.at(-1); // utilisation reports are sorted by central api
    const dueReports = getDueReportDates(mostRecentReport);

    res.status(200).send(dueReports);
  } catch (error) {
    console.error('Cannot get due reports %s', error);
    res.status(500).send({ status: 500, message: 'Failed to get due reports' });
  }
};

module.exports = {
  getDueReports,
  getDueReportDates,
};
