const { subMonths, isSameMonth, addMonths, format } = require('date-fns');
const api = require('../../api');

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
  const currentReportDate = subMonths(currentDate, 1);

  // If most recent report is empty, assume no reports (and therefore current report is due)
  let dueReportDate;
  if (mostRecentReport) {
    const { month, year } = mostRecentReport;
    const lastSubmittedReportDate = new Date(year, month - 1);
    if (isSameMonth(currentReportDate, lastSubmittedReportDate)) {
      return [];
    }
    dueReportDate = addMonths(lastSubmittedReportDate, 1);
  } else {
    dueReportDate = subMonths(currentReportDate, 1);
  }

  const dueReportDates = [];
  while (!isSameMonth(dueReportDate, currentReportDate)) {
    const year = format(dueReportDate, 'yyyy');
    const month = format(dueReportDate, 'MMMM');
    dueReportDates.push({ year, month });
    addMonths(dueReportDate, 1);
  }
  // Add current report date
  const year = format(dueReportDate, 'yyyy');
  const month = format(dueReportDate, 'MMMM');
  dueReportDates.push({ year, month });
  addMonths(dueReportDate, 1);
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
