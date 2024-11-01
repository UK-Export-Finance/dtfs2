const { eachMonthOfInterval, getYear, getMonth, subMonths, addMonths } = require('date-fns');
const {
  UtilisationReportEntityMockBuilder,
  AzureFileInfoEntity,
  MOCK_AZURE_FILE_INFO,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  REQUEST_PLATFORM_TYPE,
} = require('@ukef/dtfs2-common');
const { BANK1_PAYMENT_REPORT_OFFICER1, BANK2_PAYMENT_REPORT_OFFICER1 } = require('../../../e2e-fixtures');

const bankId = BANK1_PAYMENT_REPORT_OFFICER1.bank.id;

const createAzureFileInfo = () => AzureFileInfoEntity.create({ ...MOCK_AZURE_FILE_INFO, requestSource: { platform: REQUEST_PLATFORM_TYPE.SYSTEM } });

function* idGenerator() {
  let id = 0;
  while (true) {
    id += 1;
    yield id;
  }
}
const reportIdGenerator = idGenerator();

const generateReportDetails = (year, month) =>
  UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION)
    .withBankId(bankId)
    .withId(reportIdGenerator.next().value)
    .withReportPeriod({
      start: { month, year },
      end: { month, year },
    })
    .withDateUploaded(new Date(year, month - 1))
    // .withUploadedByUserId() // we don't have access to the user id without querying the mongo database
    .withAzureFileInfo(createAzureFileInfo())
    .build();

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

const february2023ReportDetails = [
  UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED)
    .withId(reportIdGenerator.next().value)
    .withBankId(bankId)
    .withReportPeriod({
      start: { month: 2, year: 2023 },
      end: { month: 2, year: 2023 },
    })
    .build(),
];

const march2023ReportDetails = [
  UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED)
    .withId(reportIdGenerator.next().value)
    .withBankId(bankId)
    .withReportPeriod({
      start: { month: 3, year: 2023 },
      end: { month: 3, year: 2023 },
    })
    .build(),
];

const december2023ToFebruary2024ReportDetails = [
  UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED)
    .withId(reportIdGenerator.next().value)
    .withBankId(BANK2_PAYMENT_REPORT_OFFICER1.bank.id)
    .withReportPeriod({
      start: { month: 12, year: 2023 },
      end: { month: 2, year: 2024 },
    })
    .build(),
];

const generateUpToDateReportDetails = () => {
  const currentReportPeriod = subMonths(new Date(), 1);
  const oneIndexedMonth = getMonth(currentReportPeriod) + 1;
  const year = getYear(currentReportPeriod);
  const reportDetails = generateReportDetails(year, oneIndexedMonth);
  return [reportDetails];
};

const upToDateReportDetails = generateUpToDateReportDetails();

/**
 * There are multiple reports in the fixtures which require an existing facility with matching
 * UKEF facility ID to test the valid upload journey.
 * The UKEF facility ID for the below facility is used in the following fixtures files:
 * - valid-utilisation-report-February_2023_monthly.xlsx
 * - valid-utilisation-report-February_2024_quarterly.xlsx
 * - valid-utilisation-report-next_week.xlsx
 * - valid-utilisation-report-November_2023_quarterly.xlsx
 * - valid-utilisation-report-September_2023_monthly.xlsx
 */
const tfmFacilityForReport = {
  facilitySnapshot: {
    ukefFacilityId: '20001371',
    value: 1000,
    coverStartDate: new Date().getTime(),
    coverEndDate: addMonths(new Date(), 5).getTime(),
    interestPercentage: 5,
    dayCountBasis: 5,
    coverPercentage: 80,
  },
};

module.exports = {
  previousReportDetails,
  february2023ReportDetails,
  march2023ReportDetails,
  upToDateReportDetails,
  december2023ToFebruary2024ReportDetails,
  tfmFacilityForReport,
};
