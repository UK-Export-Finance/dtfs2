import { Response } from 'supertest';
import { ObjectId } from 'mongodb';
import { IsoDateTimeStamp, PortalUser, UtilisationReportEntity, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import axios from 'axios';
import app from '../../../src/createApp';
import createApi from '../../api';
import { SqlDbHelper } from '../../sql-db-helper';
import { GetUtilisationReportResponse } from '../../../src/types/utilisation-reports';
import mongoDbClient from '../../../src/drivers/db-client';
import { wipe } from '../../wipeDB';

const api = createApi(app);

const getUrl = (bankId: string) => `/v1/bank/${bankId}/utilisation-reports`;

const saveReportsToDatabase = async (...reports: UtilisationReportEntity[]): Promise<UtilisationReportEntity[]> =>
  await SqlDbHelper.saveNewEntries('UtilisationReport', reports);

type UtilisationReportResponse = GetUtilisationReportResponse & {
  dateUploaded: IsoDateTimeStamp;
};

interface CustomErrorResponse extends Response {
  body: { errors: { msg: string }[] };
}

interface CustomSuccessResponse extends Response {
  body: UtilisationReportResponse[];
}

describe('GET /v1/bank/:bankId/utilisation-reports', () => {
  const portalUser = {
    _id: new ObjectId(),
    firstname: 'Test',
    surname: 'User',
  } as PortalUser;
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
    const response: CustomErrorResponse = await api.get(getUrl('invalid-id'));

    // Assert
    expect(response.status).toEqual(400);

    expect(response.body.errors[0]?.msg).toEqual('The bank id provided should be a string of numbers');
  });

  it('gets utilisation reports', async () => {
    // Arrange
    const bankId = '13';

    const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
      .withId(1)
      .withUploadedByUserId(portalUserId)
      .withBankId(bankId)
      .build();

    const nonUploadedReport = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED')
      .withId(2)
      .withUploadedByUserId(portalUserId)
      .withBankId(bankId)
      .build();

    await saveReportsToDatabase(uploadedReport, nonUploadedReport);

    // Act
    const response: CustomSuccessResponse = await api.get(getUrl(bankId));

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(2);
  });

  it('gets only the utilisation reports which have been uploaded when the excludeNotReceived query param is set to true', async () => {
    // Arrange
    const bankId = '13';

    const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
      .withId(1)
      .withUploadedByUserId(portalUserId)
      .withBankId(bankId)
      .build();

    const notReceivedReport = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED')
      .withId(2)
      .withUploadedByUserId(portalUserId)
      .withBankId(bankId)
      .build();

    const nonUploadedMarkedReconciledReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_COMPLETED')
      .withId(3)
      .withUploadedByUserId(portalUserId)
      .withBankId(bankId)
      .withAzureFileInfo(undefined)
      .build();

    await saveReportsToDatabase(uploadedReport, notReceivedReport, nonUploadedMarkedReconciledReport);

    // Act
    const response: CustomSuccessResponse = await api.get(`${getUrl(bankId)}?excludeNotReceived=true`);

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(1);
    const ids = response.body.map((report) => report.id);
    expect(ids).toContain(uploadedReport.id);
  });

  it('gets uploaded utilisation reports for specified period', async () => {
    // Arrange
    const bankId = '13';
    const reportPeriod = {
      start: { month: 11, year: 2021 },
      end: { month: 12, year: 2021 },
    };

    const uploadedReportForReportPeriod = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
      .withId(1)
      .withUploadedByUserId(portalUserId)
      .withBankId(bankId)
      .withReportPeriod(reportPeriod)
      .build();

    const uploadedReportForDifferentReportPeriod = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
      .withId(2)
      .withUploadedByUserId(portalUserId)
      .withBankId(bankId)
      .withReportPeriod({ start: { month: 12, year: 2021 }, end: { month: 1, year: 2022 } })
      .build();

    await saveReportsToDatabase(uploadedReportForReportPeriod, uploadedReportForDifferentReportPeriod);

    // Act
    const urlWithQueryParams = axios.getUri({ url: getUrl(bankId), params: { reportPeriod, excludeNotReceived: true } });
    const response: CustomSuccessResponse = await api.get(urlWithQueryParams);

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(1);
    expect(response.body[0].id).toEqual(uploadedReportForReportPeriod.id);
  });
});
