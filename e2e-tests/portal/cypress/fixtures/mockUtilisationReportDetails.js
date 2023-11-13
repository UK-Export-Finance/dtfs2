const {
  subMonths,
  eachMonthOfInterval,
  getYear,
  getMonth,
} = require('date-fns');
const { BANK1_PAYMENT_REPORT_OFFICER1 } = require('./users');

const BANK1 = {
  id: '9',
  name: 'BANK1',
};

const generateReportDetails = (year, month, dateUploaded) => {
  const bank = BANK1;
  const path = 'www.abc.com';
  const uploadedBy = BANK1_PAYMENT_REPORT_OFFICER1;
  const populatedDateUploaded = dateUploaded ?? new Date(year, month - 1);
  return {
    bank,
    month,
    year,
    dateUploaded: populatedDateUploaded,
    uploadedBy,
    path,
  };
};

const generateReports = (startMonthDate, endMonthDate) =>
  eachMonthOfInterval({
    start: startMonthDate,
    end: endMonthDate,
  }).map((reportMonthDate) => {
    const year = getYear(reportMonthDate);
    const month = getMonth(reportMonthDate);
    return generateReportDetails(year, month);
  });

// Reports to be populated for 2020, 2022 and 2023 (ie. not 2021 to match specific test case)
const previousReportDetails = generateReports(new Date('2020-01-01'), new Date('2023-01-01')).filter((report) => report.year !== 2021);

const generateOverdueReports = () => {
  const currentDate = new Date();
  const firstReportMonth = subMonths(currentDate, 5);
  const lastReportMonth = subMonths(currentDate, 1);

  return [generateReports(firstReportMonth, lastReportMonth)];
};

const overdueReportDetails = generateOverdueReports();

module.exports = {
  previousReportDetails,
  overdueReportDetails,
};
