const {
  eachMonthOfInterval,
  getYear,
  getMonth,
  subMonths,
} = require('date-fns');
const { BANK1_PAYMENT_REPORT_OFFICER1 } = require('./users');

const BANK1 = {
  id: '9',
  name: 'BANK1',
};

const generateReportDetails = (year, month) => {
  const bank = BANK1;
  const path = 'www.abc.com';
  const uploadedBy = BANK1_PAYMENT_REPORT_OFFICER1;
  const dateUploaded = new Date(year, month - 1);
  return {
    bank,
    month,
    year,
    dateUploaded,
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
    const month = getMonth(reportMonthDate) + 1;
    return generateReportDetails(year, month);
  });

// Reports to be populated for 2020, 2022 and 2023 (ie. not 2021 to match specific test case)
const previousReportDetails = generateReports(new Date('2020-01-01'), new Date('2023-01-01')).filter((report) => report.year !== 2021);

const january2023ReportDetails = [{
  bank: BANK1,
  month: 1,
  year: 2023,
  dateUploaded: new Date(2023, 0),
  uploadedBy: BANK1_PAYMENT_REPORT_OFFICER1,
  path: 'www.abc.com',
}];

const generateUpToDateReportDetails = () => {
  const currentReportPeriod = subMonths(new Date(), 1);
  const oneIndexedMonth = getMonth(currentReportPeriod) + 1;
  const year = getYear(currentReportPeriod);
  const reportDetails = generateReportDetails(year, oneIndexedMonth);
  return [reportDetails];
};

const upToDateReportDetails = generateUpToDateReportDetails();

module.exports = {
  previousReportDetails,
  january2023ReportDetails,
  upToDateReportDetails,
};
