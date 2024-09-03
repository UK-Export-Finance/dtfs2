const { eachMonthOfInterval, getYear, getMonth, subMonths } = require('date-fns');
const {
  UtilisationReportEntityMockBuilder,
  AzureFileInfoEntity,
  MOCK_AZURE_FILE_INFO,
  FacilityUtilisationDataEntityMockBuilder,
} = require('@ukef/dtfs2-common');
const { BANK1_PAYMENT_REPORT_OFFICER1, BANK2_PAYMENT_REPORT_OFFICER1 } = require('../../../e2e-fixtures');

const bankId = BANK1_PAYMENT_REPORT_OFFICER1.bank.id;

const createAzureFileInfo = () => AzureFileInfoEntity.create({ ...MOCK_AZURE_FILE_INFO, requestSource: { platform: 'SYSTEM' } });

function* idGenerator() {
  let id = 0;
  while (true) {
    id += 1;
    yield id;
  }
}
const reportIdGenerator = idGenerator();

const generateReportDetails = (year, month) =>
  UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
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
  UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED')
    .withId(reportIdGenerator.next().value)
    .withBankId(bankId)
    .withReportPeriod({
      start: { month: 2, year: 2023 },
      end: { month: 2, year: 2023 },
    })
    .build(),
];

const march2023ReportDetails = [
  UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED')
    .withId(reportIdGenerator.next().value)
    .withBankId(bankId)
    .withReportPeriod({
      start: { month: 3, year: 2023 },
      end: { month: 3, year: 2023 },
    })
    .build(),
];

const december2023ToFebruary2024ReportDetails = [
  UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED')
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

const facilityUtilisationDataForReport = FacilityUtilisationDataEntityMockBuilder.forId() // lines up with the "valid-<...>.xlsx" files UKEF facility ID column
  .build();

module.exports = {
  previousReportDetails,
  february2023ReportDetails,
  march2023ReportDetails,
  upToDateReportDetails,
  december2023ToFebruary2024ReportDetails,
  facilityUtilisationDataForReport,
};
