import { Response } from 'supertest';
import {
  FeeRecordEntityMockBuilder,
  MONGO_DB_COLLECTIONS,
  PortalUser,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
  getCurrentReportPeriodForBankSchedule,
  getSubmissionMonthForReportPeriod,
} from '@ukef/dtfs2-common';
import { wipe } from '../../wipeDB';
import { MOCK_BANKS } from '../../mocks/banks';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { UtilisationReportReconciliationSummary, UtilisationReportReconciliationSummaryItem } from '../../../src/types/utilisation-reports';
import { withoutMongoId } from '../../../src/helpers/mongodb';
import { aPortalUser } from '../../../test-helpers';
import { mongoDbClient } from '../../../src/drivers/db-client';

console.error = jest.fn();

interface CustomResponse extends Response {
  body: UtilisationReportReconciliationSummary[];
}

const BASE_URL = '/v1/utilisation-reports/reconciliation-summary/:submissionMonth';

describe(`GET ${BASE_URL}`, () => {
  beforeAll(async () => {
    await wipe([MONGO_DB_COLLECTIONS.BANKS]);
    await testApi.post(withoutMongoId(MOCK_BANKS.BARCLAYS)).to('/v1/bank');

    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAll();
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAll();
  });

  it('returns a 200 response when the submissionMonth is a valid ISO month', async () => {
    // Arrange
    const submissionMonth = '2023-11';

    // Act
    const response: CustomResponse = await testApi.get(`/v1/utilisation-reports/reconciliation-summary/${submissionMonth}`);

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].submissionMonth).toEqual(submissionMonth);
    expect(response.body[0].items).toHaveLength(0);
  });

  it('returns a 400 response when the submissionMonth is not a valid ISO month', async () => {
    // Arrange
    const submissionMonth = 'invalid';

    // Act
    const response: CustomResponse = await testApi.get(`/v1/utilisation-reports/reconciliation-summary/${submissionMonth}`);

    // Assert
    expect(response.status).toEqual(400);
  });

  it('returns a 200 response with the correct number of associated fee records', async () => {
    // Arrange
    const reportPeriod = getCurrentReportPeriodForBankSchedule(MOCK_BANKS.BARCLAYS.utilisationReportPeriodSchedule);
    const submissionMonth = getSubmissionMonthForReportPeriod(reportPeriod);

    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS')
      .withBankId(MOCK_BANKS.BARCLAYS.id)
      .withReportPeriod(reportPeriod)
      .build();
    await SqlDbHelper.saveNewEntry('UtilisationReport', utilisationReport);

    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).build(),
    ];
    await SqlDbHelper.saveNewEntries('FeeRecord', feeRecords);

    // Act
    const response: CustomResponse = await testApi.get(`/v1/utilisation-reports/reconciliation-summary/${submissionMonth}`);

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].submissionMonth).toEqual(submissionMonth);
    expect(response.body[0].items).toHaveLength(1);
    expect(response.body[0].items[0].totalFeesReported).toEqual(feeRecords.length);
    expect(response.body[0].items[0].reportedFeesLeftToReconcile).toEqual(feeRecords.length);
  });
});

interface CustomErrorResponse extends Response {
  body: { errors: { msg: string }[] };
}

interface CustomSuccessResponse extends Response {
  body: {
    bankName: string;
    year: string;
    reports: UtilisationReportReconciliationSummaryItem[];
  };
}

const saveReportsToDatabase = async (...reports: UtilisationReportEntity[]): Promise<UtilisationReportEntity[]> =>
  await SqlDbHelper.saveNewEntries('UtilisationReport', reports);

describe('GET /v1/bank/:bankId/utilisation-reports/reconciliation-summary-by-year/:year', () => {
  const getUrl = (bankId: string, year: string) => `/v1/bank/${bankId}/utilisation-reports/reconciliation-summary-by-year/${year}`;

  const portalUser: PortalUser = aPortalUser();
  const portalUserId = portalUser._id.toString();

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    await wipe(['users']);
    const usersCollection = await mongoDbClient.getCollection('users');
    await usersCollection.insertOne(portalUser);
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  afterAll(async () => {
    await wipe(['users']);
  });

  it('returns 400 when an invalid bank id is provided', async () => {
    // Act
    const response: CustomErrorResponse = await testApi.get(getUrl('invalid-id', '2024'));

    // Assert
    expect(response.status).toEqual(400);

    expect(response.body.errors[0]?.msg).toEqual('The bank id provided should be a string of numbers');
  });

  it('returns 400 when an invalid year is provided', async () => {
    // Act
    const bankId = '13';
    const response: CustomErrorResponse = await testApi.get(getUrl(bankId, 'invalid-year'));

    // Assert
    expect(response.status).toEqual(400);

    expect(response.body.errors[0]?.msg).toEqual("Invalid 'year' path param provided");
  });

  it('gets utilisation report summaries', async () => {
    // Arrange
    const bankId = '956';
    const year = '2023';

    const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
      .withId(1)
      .withBankId(bankId)
      .withUploadedByUserId(portalUserId)
      .build();

    const reconciliationCompletedReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_COMPLETED').withId(2).withBankId(bankId).build();

    await saveReportsToDatabase(uploadedReport, reconciliationCompletedReport);

    // Act
    const response: CustomSuccessResponse = await testApi.get(getUrl(bankId, year));

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body.reports.length).toEqual(2);
  });

  it("gets only the utilisation reports which are not in the 'REPORT_NOT_RECEIVED'", async () => {
    // Arrange
    const bankId = '956';
    const year = '2023';

    const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
      .withId(1)
      .withBankId(bankId)
      .withUploadedByUserId(portalUserId)
      .build();

    const notReceivedReport = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').withId(2).withBankId(bankId).build();

    const reconciliationCompletedReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_COMPLETED')
      .withId(3)
      .withBankId(bankId)
      .withUploadedByUserId(portalUserId)
      .build();

    await saveReportsToDatabase(uploadedReport, notReceivedReport, reconciliationCompletedReport);

    // Act
    const response: CustomSuccessResponse = await testApi.get(`${getUrl(bankId, year)}`);

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body.reports.length).toEqual(2);
    const ids = response.body.reports.map((report) => report.reportId);
    expect(ids).toContain(uploadedReport.id);
    expect(ids).toContain(reconciliationCompletedReport.id);
  });

  it('gets utilisation reports for specified year', async () => {
    // Arrange
    const bankId = '956';
    const year = '2021';
    const reportPeriod = {
      start: { month: 11, year: 2021 },
      end: { month: 12, year: 2021 },
    };

    const uploadedReportForYear = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
      .withId(1)
      .withBankId(bankId)
      .withReportPeriod(reportPeriod)
      .withUploadedByUserId(portalUserId)
      .build();

    const uploadedReportForDifferentYear = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
      .withId(2)
      .withBankId(bankId)
      .withReportPeriod({ start: { month: 1, year: 2022 }, end: { month: 2, year: 2022 } })
      .withUploadedByUserId(portalUserId)
      .build();

    await saveReportsToDatabase(uploadedReportForYear, uploadedReportForDifferentYear);

    // Act
    const response: CustomSuccessResponse = await testApi.get(`${getUrl(bankId, year)}`);

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body.reports.length).toEqual(1);
    expect(response.body.reports[0].reportId).toEqual(uploadedReportForYear.id);
  });

  it('returns no reports when no reports exist for specified bank and year', async () => {
    // Arrange
    const bankId = '956';
    const year = '2021';
    const reportPeriod = {
      start: { month: 11, year: 2021 },
      end: { month: 12, year: 2021 },
    };

    const notReceivedReportForReportPeriod = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED')
      .withId(1)
      .withBankId(bankId)
      .withReportPeriod(reportPeriod)
      .build();

    const uploadedReportForDifferentReportPeriod = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
      .withId(2)
      .withBankId(bankId)
      .withReportPeriod({ start: { month: 1, year: 2022 }, end: { month: 2, year: 2022 } })
      .withUploadedByUserId(portalUserId)
      .build();

    await saveReportsToDatabase(notReceivedReportForReportPeriod, uploadedReportForDifferentReportPeriod);

    // Act
    const response: CustomSuccessResponse = await testApi.get(`${getUrl(bankId, year)}`);

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body.reports.length).toEqual(0);
  });
});
