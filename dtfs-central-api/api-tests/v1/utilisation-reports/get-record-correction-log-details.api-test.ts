import { Response } from 'supertest';
import { format } from 'date-fns';
import {
  Bank,
  FeeRecordEntityMockBuilder,
  RECONCILIATION_IN_PROGRESS,
  FeeRecordCorrectionEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
  ReportPeriod,
  GetRecordCorrectionLogDetailsResponseBody,
  DATE_FORMATS,
} from '@ukef/dtfs2-common';
import { HttpStatusCode, getUri } from 'axios';
import { withSqlIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { wipe } from '../../wipeDB';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { aBank } from '../../../test-helpers';

const BASE_URL = '/v1/utilisation-reports/record-correction-log-details/:correctionId';

interface CustomResponse extends Response {
  body: GetRecordCorrectionLogDetailsResponseBody;
}

console.error = jest.fn();

describe(`GET ${BASE_URL}`, () => {
  const getUrl = (correctionId: number | string) =>
    getUri({
      url: BASE_URL.replace(':correctionId', correctionId.toString()),
    });

  const today = new Date();

  const bankId = '123';
  const bankName = 'Test bank';

  const bankTeamName = 'Test Bank Payment Reporting Team';
  const bankTeamEmails = ['test1@ukexportfinance.gov.uk', 'test2@ukexportfinance.gov.uk'];
  const bankTeamEmailsSerialized = bankTeamEmails.join(',');

  const bank: Bank = {
    ...aBank(),
    id: bankId,
    name: bankName,
    paymentOfficerTeam: {
      teamName: bankTeamName,
      emails: bankTeamEmails,
    },
  };

  const reportPeriod: ReportPeriod = {
    start: { month: 1, year: 2024 },
    end: { month: 1, year: 2024 },
  };

  const reportId = 1;
  const feeRecordId = 2;

  const reconciliationInProgressReport = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
    .withId(reportId)
    .withBankId(bankId)
    .withReportPeriod(reportPeriod)
    .build();

  const feeRecord = FeeRecordEntityMockBuilder.forReport(reconciliationInProgressReport).withId(feeRecordId).build();

  const recordCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, false)
    .withDateRequested(today)
    .withBankTeamName(bankTeamName)
    .withBankTeamEmails(bankTeamEmailsSerialized)
    .build();

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrection');

    await wipe(['banks']);

    const banksCollection = await mongoDbClient.getCollection('banks');
    await banksCollection.insertOne(bank);
  });

  beforeEach(async () => {
    await SqlDbHelper.saveNewEntry('UtilisationReport', reconciliationInProgressReport);
    await SqlDbHelper.saveNewEntry('FeeRecord', feeRecord);
    await SqlDbHelper.saveNewEntry('FeeRecordCorrection', recordCorrection);
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAllEntries('FeeRecord');
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrection');
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('FeeRecord');
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrection');

    await wipe(['banks']);
  });

  withSqlIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url) => testApi.get(url),
  });

  it(`returns a ${HttpStatusCode.NotFound} when the record correction cannot be found by id`, async () => {
    // Act
    const response: CustomResponse = await testApi.get(getUrl(recordCorrection.id + 1));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it(`returns a ${HttpStatusCode.Ok} when a correction with the provided id is found`, async () => {
    // Act
    const response: CustomResponse = await testApi.get(getUrl(recordCorrection.id));

    const expected = {
      correctionDetails: {
        facilityId: feeRecord.facilityId,
        exporter: feeRecord.exporter,
        formattedReasons: 'Utilisation is incorrect',
        formattedDateSent: format(today, DATE_FORMATS.DD_MMM_YYYY),
        formattedOldRecords: '100.00',
        formattedCorrectRecords: '-',
        isCompleted: false,
        bankTeamName,
        bankTeamEmails,
        additionalInfo: recordCorrection.additionalInfo,
        formattedBankCommentary: '-',
        formattedDateReceived: '-',
        formattedRequestedByUser: `${recordCorrection.requestedByUser.firstName} ${recordCorrection.requestedByUser.lastName}`,
      },
      bankName,
      reportId,
      reportPeriod,
    };

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
    expect(response.body).toEqual(expected);
  });
});
