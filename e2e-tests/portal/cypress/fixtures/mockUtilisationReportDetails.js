const {
  eachMonthOfInterval,
  getYear,
  getMonth,
  subMonths,
} = require('date-fns');
const { BANK1_PAYMENT_REPORT_OFFICER1 } = require('../../../e2e-fixtures');

const BANK1 = {
  id: BANK1_PAYMENT_REPORT_OFFICER1.bank.id,
  name: BANK1_PAYMENT_REPORT_OFFICER1.bank.name,
};

const generateReportDetails = (year, month) => {
  const bank = BANK1;
  const uploadedBy = BANK1_PAYMENT_REPORT_OFFICER1;
  const dateUploaded = new Date(year, month - 1);
  return {
    bank,
    reportPeriod: {
      start: {
        month,
        year,
      },
      end: {
        month,
        year,
      },
    },
    dateUploaded,
    uploadedBy,
    azureFileInfo: null,
    status: 'PENDING_RECONCILIATION',
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
const previousReportDetails = generateReports(new Date('2020-01-01'), new Date('2023-01-01')).filter(({ reportPeriod }) => reportPeriod.start.year !== 2021);

const january2023ReportDetails = [
  {
    bank: BANK1,
    reportPeriod: {
      start: {
        month: 1,
        year: 2023,
      },
      end: {
        month: 1,
        year: 2023,
      },
    },
    dateUploaded: new Date(2023, 0),
    uploadedBy: BANK1_PAYMENT_REPORT_OFFICER1,
    azureFileInfo: null,
    status: 'PENDING_RECONCILIATION',
  },
];

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
