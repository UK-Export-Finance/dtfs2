const api = require('../../api');
const { getMonthName } = require('./previous-reports.controller');

const getMostRecentReport = (reports) => {
  if (!reports || reports.length === 0) {
    return null;
  }

  let mostRecentYear = 0;
  let mostRecentMonth = 0;
  let mostRecentReportIndex = 0;
  reports.forEach((report, index) => {
    const { month, year } = report;
    if (year > mostRecentYear) {
      mostRecentYear = year;
      mostRecentMonth = month;
      mostRecentReportIndex = index;
    } else if (month > mostRecentMonth) {
      mostRecentMonth = month;
      mostRecentReportIndex = index;
    }
  });
  return reports[mostRecentReportIndex];
};

const getDueReportDates = (mostRecentReport) => {
  const currentDate = new Date();
  const currentReportingYear = currentDate.getFullYear();
  const currentReportingMonth = currentDate.getMonth() + 1; // Date.getMonth() is zero indexed

  // If most recent report is empty, assume no reports (and therefore current report is due)
  let reportingMonth = currentReportingMonth - 1;
  let reportingYear = currentReportingYear;
  if (mostRecentReport) {
    const { month, year } = mostRecentReport;

    if (currentReportingYear === year && currentReportingMonth === month) {
      return [];
    }

    const nextReportingMonth = month + 1;

    reportingMonth = nextReportingMonth > 12 ? 1 : nextReportingMonth;
    reportingYear = nextReportingMonth > 12 ? year + 1 : year;
  }

  const dueReportDates = [];
  while (reportingYear < currentReportingYear || reportingMonth < currentReportingMonth) {
    const reportingMonthName = getMonthName(reportingMonth);
    dueReportDates.push({
      year: reportingYear,
      month: reportingMonthName,
    });
    reportingMonth += 1;

    if (reportingMonth > 12) {
      reportingYear += 1;
      reportingMonth = 1;
    }
  }
  return dueReportDates;
};

const getDueReports = async (req, res) => {
  try {
    const { bankId } = req.params;

    const { data } = await api.getUtilisationReports(bankId);
    const mostRecentReport = getMostRecentReport(data);
    const dueReports = getDueReportDates(mostRecentReport);

    res.status(200).send(dueReports);
  } catch (error) {
    console.error('Cannot get next due report %s', error);
    res.status(500).send({ status: 500, message: 'Failed to get next due report' });
  }
};

module.exports = {
  getDueReports,
  getMostRecentReport,
  getDueReportDates,
};
