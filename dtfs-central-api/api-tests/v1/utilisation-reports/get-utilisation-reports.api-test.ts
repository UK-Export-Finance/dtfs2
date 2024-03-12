import { Response } from 'supertest';
import { IsoDateTimeStamp, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import axios from 'axios';
import {
  aNonUploadedMarkedReconciledUtilisationReportEntity,
  aNotReceivedUtilisationReportEntity,
  anUploadedUtilisationReportEntity,
} from '../../mocks/entities/utilisation-report-entity';
import app from '../../../src/createApp';
import createApi from '../../api';
import { wipeAllUtilisationReports } from '../../test-helpers/wipe-sql-db';
import { GetUtilisationReportResponse } from '../../../src/types/utilisation-reports';

const api = createApi(app);

const getUrl = (bankId: string) => `/v1/bank/${bankId}/utilisation-reports`;

const saveReportToDatabase = async (report: UtilisationReportEntity): Promise<UtilisationReportEntity> =>
  await SqlDbDataSource.getRepository(UtilisationReportEntity).save(report);

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
  beforeAll(async () => {
    await SqlDbDataSource.initialize();
    await wipeAllUtilisationReports();
  });

  afterEach(async () => {
    await wipeAllUtilisationReports();
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
    const uploadedReport: UtilisationReportEntity = { ...anUploadedUtilisationReportEntity(), bankId };
    const nonUploadedReport: UtilisationReportEntity = { ...aNotReceivedUtilisationReportEntity(), bankId };
    await saveReportToDatabase(uploadedReport);
    await saveReportToDatabase(nonUploadedReport);

    // Act
    const response: CustomSuccessResponse = await api.get(getUrl(bankId));

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(2);
  });

  it('gets received and reconciled utilisation reports when excludeNotReceived query param is true', async () => {
    // Arrange
    const bankId = '13';
    const uploadedReport: UtilisationReportEntity = { ...anUploadedUtilisationReportEntity(), bankId };
    const notReceivedReport: UtilisationReportEntity = { ...aNotReceivedUtilisationReportEntity(), bankId };
    const nonUploadedMarkedReconciledReport: UtilisationReportEntity = { ...aNonUploadedMarkedReconciledUtilisationReportEntity(), bankId };
    const { id: idOfUploadedReport } = await saveReportToDatabase(uploadedReport);
    await saveReportToDatabase(notReceivedReport);
    const { id: idOfReconciledReport } = await saveReportToDatabase(nonUploadedMarkedReconciledReport);

    // Act
    const response: CustomSuccessResponse = await api.get(`${getUrl(bankId)}?excludeNotReceived=true`);

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(2);
    const ids = response.body.map((report) => report.id);
    expect(ids).toContain(idOfUploadedReport);
    expect(ids).toContain(idOfReconciledReport);
  });

  it('gets uploaded utilisation reports for specified period', async () => {
    // Arrange
    const bankId = '13';
    const reportPeriod = {
      start: { month: 11, year: 2021 },
      end: { month: 12, year: 2021 },
    };
    const uploadedReportForReportPeriod: UtilisationReportEntity = { ...anUploadedUtilisationReportEntity(), bankId, reportPeriod: { ...reportPeriod } };
    const uploadedReportForDifferentReportPeriod: UtilisationReportEntity = {
      ...anUploadedUtilisationReportEntity(),
      bankId,
      reportPeriod: { start: { month: 12, year: 2021 }, end: { month: 1, year: 2022 } },
    };
    const { id: idOfReportForReportPeriod } = await saveReportToDatabase(uploadedReportForReportPeriod);
    await saveReportToDatabase(uploadedReportForDifferentReportPeriod);

    // Act
    const urlWithQueryParams = axios.getUri({ url: getUrl(bankId), params: { reportPeriod, excludeNotReceived: true } });
    const response: CustomSuccessResponse = await api.get(urlWithQueryParams);

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(1);
    expect(response.body[0].id).toEqual(idOfReportForReportPeriod);
  });
});
