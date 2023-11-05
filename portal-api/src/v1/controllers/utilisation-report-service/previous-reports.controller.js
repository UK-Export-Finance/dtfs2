const orderBy = require('lodash.orderby');
const api = require('../../api');
const { getMonthName } = require('../../../utils/getMonthName');

const getYears = (reports) => {
  const years = reports.map((report) => report.year);
  return [...new Set(years)];
};

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

const getPreviousReportsByBankId = async (req, res) => {
  try {
    const { bankId } = req.params;

    const { status, data } = await api.getUtilisationReports(bankId);

    if (status !== 200) {
      console.error('Unable to get previous reports');
      return res.status(500).send(data);
    }

    const years = getYears(data);
    const groupedReports = getReportsGroupedByYear(years, data);
    const reportsGroupedByYear = populateOmittedYears(groupedReports, years);
    const reportsOrderedByDescendingYear = orderBy(reportsGroupedByYear, ['year'], ['desc']);

    return res.status(200).send(reportsOrderedByDescendingYear);
  } catch (error) {
    console.error('Unable to get previous reports %O', error);
    return res.status(500).send({ status: 500, message: 'Failed to get previous reports' });
  }
};

module.exports = {
  getPreviousReportsByBankId,
  getYears,
  getReportsGroupedByYear,
  populateOmittedYears,
};
