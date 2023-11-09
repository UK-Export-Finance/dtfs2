const { BANK1_PAYMENT_REPORT_OFFICER1 } = require('./users');

const BANK1 = {
  id: '9',
  name: 'BANK1',
};

const generateReportDetails = (year, month, dateUploaded) => {
  const bank = BANK1;
  const path = 'www.abc.com';
  const uploadedBy = BANK1_PAYMENT_REPORT_OFFICER1;
  const populatedDateUploaded = dateUploaded ?? new Date(year, month - 1, 5, 12, 35).toISOString();
  return {
    bank,
    month,
    year,
    dateUploaded: populatedDateUploaded,
    uploadedBy,
    path,
  };
};

const generateReports = (startYear, startMonth, endYear, endMonth) => {
  const reports = [];

  if (startMonth < 1 || startMonth > 12) {
    throw new Error('Cannot generate reports using supplied `startMonth` (must be between 1 and 12)');
  }
  if (endMonth < 1 || endMonth > 12) {
    throw new Error('Cannot generate reports using supplied `endMonth` (must be between 1 and 12)');
  }

  let year = startYear;
  let month = startMonth;
  while (year < endYear || month <= endMonth) {
    const reportDetails = generateReportDetails(year, month);
    reports.push(reportDetails);

    month += 1;
    if (month > 12) {
      year += 1;
      month = 1;
    }
  }

  return reports;
};

// Reports to be populated for 2020, 2022 and 2023 (ie. not 2021 to match specific test case)
const previousReportDetails = generateReports(2020, 1, 2023, 1).filter((report) => report.year !== 2021);

const generateOverdueReports = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const month = currentMonth - 4 > 0 ? currentMonth - 4 : 12 + currentMonth - 4;
  const year = currentMonth - 4 > 0 ? currentYear : currentYear - 1;

  return [generateReportDetails(year, month)];
};

const overdueReportDetails = generateOverdueReports();

module.exports = {
  previousReportDetails,
  overdueReportDetails,
};
