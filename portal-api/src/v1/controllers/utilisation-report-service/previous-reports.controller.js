const db = require('../../../drivers/db-client');

const getExistingYear = (groupedReports, year) => {
  let existingYear;
  for (let i = 0; i < groupedReports.length; i + 1) {
    if (groupedReports[i].year === year) {
      existingYear = groupedReports[i];
      break;
    }
  }
  return existingYear;
};

const getUtilisationReportsFromDb = async (bankId) => {
  const utilisationReportsCollection = await db.getCollection('utilisation-reports');
  return utilisationReportsCollection.aggregate([
    {
      $match: {
        bankId,
      },
    },
    {
      $sort: {
        year: 1,
        month: 1,
      },
    },
  ]).toArray();
};

const getMonthName = (monthNumber) => {
  const date = new Date();
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
          for (let i = 1; i < year - groupedReports[groupedReports.length - 1].year; i + 1) {
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

    // Should I add validation for user bank ID here?
    const reports = await getUtilisationReportsFromDb(bankId);
    const groupedReports = getGroupedReports(reports);

    res.status(200).send(groupedReports.reverse());
  } catch (error) {
    console.error('Unable to get previous reports %s', error);
  }
  res.status(200).send();
};

module.exports = {
  getPreviousReportsByBankId,
};
