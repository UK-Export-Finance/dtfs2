const api = require('../../api');

const getMonthName = (monthNumber) => {
  // date is set to 1st Jan to avoid bug when today's month has more days than target month
  const date = new Date(2023, 1, 1);
  // offset by 1 as January = 1 in Database
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('default', { month: 'long' });
};

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

    const { data } = await api.getUtilisationReports(bankId);
    const years = getYears(data);
    const groupedReports = getReportsGroupedByYear(years, data);
    const reportsGroupedByYear = populateOmittedYears(groupedReports, years);

    res.status(200).send(reportsGroupedByYear.sort((a, b) => b.year - a.year));
  } catch (error) {
    console.error('Unable to get previous reports %s', error);
  }
  res.status(200).send();
};

module.exports = {
  getPreviousReportsByBankId,
  getMonthName,
  getYears,
  getReportsGroupedByYear,
  populateOmittedYears,
};
