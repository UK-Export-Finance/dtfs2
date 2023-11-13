const orderBy = require('lodash/orderBy');
const api = require('../../api');
const { getMonthName } = require('../../../utils/date');

/**
 * Returns a set of unique years based on reports from the database.
 * @param {Object[]} reports - reports from the database
 * @returns {number[]} - unique set of years
 */
const getYears = (reports) => {
  const years = reports.map((report) => report.year);
  return [...new Set(years)];
};

/**
 * Groups database reports by year
 * @param {number[]} years - unique set of years
 * @param {Object[]} reports - reports from the database
 * @returns {Object[]} - list of objects with year and reports property
 */
const getReportsGroupedByYear = (years, reports) => years.map((year) => {
  const reportsByYear = reports
    .filter((report) => report.year === year)
    .map((report) => ({
      month: getMonthName(report.month),
      path: report.path
    }));
  return {
    year,
    reports: reportsByYear,
  };
});

/**
 * Adds an object for all year with is no database reports when there is a report for the
 * previous and future years
 * @param {Object[]} reportsGroupedByYear - list of objects with year and reports property
 * @param {number[]} years - unique set of years
 * @returns {Object[]} - list of objects with year and reports property
 */
const populateOmittedYears = (reportsGroupedByYear, years) => {
  years.forEach((year, index) => {
    if (index > 0 && year - years[index - 1] > 1) {
      let numberOfMissingYears = year - years[index - 1] - 1;
      while (numberOfMissingYears > 0) {
        reportsGroupedByYear.push({
          year: year - numberOfMissingYears,
          reports: [],
        });
        numberOfMissingYears -= 1;
      }
    }
  });
  return reportsGroupedByYear;
};

/**
 * Maps and sorts the reports from the database
 * @param {Object[]} dbReports - reports from the database
 * @returns {Object[]} - list of objects with year and reports property
 */
const mapAndSortReports = (dbReports) => {
  const years = getYears(dbReports);
  const groupedReports = getReportsGroupedByYear(years, dbReports);
  const reportsGroupedByYear = populateOmittedYears(groupedReports, years);
  return orderBy(reportsGroupedByYear, ['year'], ['desc']);
};

const getPreviousReportsByBankId = async (req, res) => {
  try {
    const { bankId } = req.params;

    const reports = await api.getUtilisationReports(bankId);

    const sortedReports = mapAndSortReports(reports);

    return res.status(200).send(sortedReports);
  } catch (error) {
    console.error('Unable to get previous reports %O', error);
    return res.status(500).send({ status: error.response?.status ?? 500, message: 'Failed to get previous reports' });
  }
};

module.exports = {
  getPreviousReportsByBankId,
  getYears,
  getReportsGroupedByYear,
  populateOmittedYears,
  mapAndSortReports,
};
