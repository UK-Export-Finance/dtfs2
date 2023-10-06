const api = require('../../api');

const getExistingYear = (groupedReports, year) => {
  let existingYear;
  for (let i = 0; i < groupedReports.length; i += 1) {
    if (groupedReports[i].year === year) {
      existingYear = groupedReports[i];
      break;
    }
  }

  return existingYear;
};

const getMonthName = (monthNumber) => {
  // date is set to 1st Jan to avoid bug when today's month has more days than target month
  const date = new Date(2023, 1, 1);
  // offset by 1 as January = 1 in Database
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('default', { month: 'long' });
};

const getGroupedReports = (reports) => {
  const groupedReports = [];
  if (reports.length) {
    reports.forEach((report) => {
      const { year } = report;
      const existingYear = getExistingYear(groupedReports, year);

      if (existingYear) {
        existingYear.reports.push({
          month: getMonthName(report.month),
          path: report.path,
        });
      } else {
        if (groupedReports.length) {
          for (let i = 1; i < year - groupedReports[groupedReports.length - 1].year; i += 1) {
            const checkExistingYear = getExistingYear(groupedReports, year - i);
            if (!checkExistingYear) {
              groupedReports.push({
                year: year - i,
                reports: [],
              });
            }
          }
        }

        groupedReports.push({
          year,
          reports: [{
            month: getMonthName(report.month),
            path: report.path,
          }]
        });
      }
    });
  }

  return groupedReports;
};

const getPreviousReportsByBankId = async (req, res) => {
  try {
    const { bankId } = req.params;

    // Add validation for user bank ID here?
    const { data } = await api.getUtilisationReports(bankId);
    const groupedReports = getGroupedReports(data);

    res.status(200).send(groupedReports.reverse());
  } catch (error) {
    console.error('Unable to get previous reports %s', error);
  }
  res.status(200).send();
};

module.exports = {
  getPreviousReportsByBankId,
  getMonthName,
  getGroupedReports,
  getExistingYear,
};
