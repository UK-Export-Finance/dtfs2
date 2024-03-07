import { Response } from 'supertest';
import { AzureFileInfo, IsoDateTimeStamp, ReportPeriod, UtilisationReportEntity, UtilisationReportReconciliationStatus } from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import axios from 'axios';
import {
  aNonUploadedMarkedCompletedUtilisationReportEntity,
  aNonUploadedUtilisationReportEntity,
  anUploadedUtilisationReportEntity,
} from '../../mocks/entities/utilisation-report-entity';
import app from '../../../src/createApp';
import createApi from '../../api';
import { wipeAllUtilisationReports } from '../../test-helpers/wipe-sql-db';

const api = createApi(app);

const getUrl = (bankId: string) => `/v1/bank/${bankId}/utilisation-reports`;

const saveReportToDatabase = async (report: UtilisationReportEntity): Promise<UtilisationReportEntity> =>
  await SqlDbDataSource.getRepository(UtilisationReportEntity).save(report);

type UtilisationReportResponseBody = {
  id: number;
  bankId: string;
  status: UtilisationReportReconciliationStatus;
  uploadedByUserId: string;
  reportPeriod: ReportPeriod;
  azureFileInfo: AzureFileInfo | null;
  dateUploaded: IsoDateTimeStamp;
};

interface CustomResponse extends Response {
  body:
    | {
        errors: {
          msg: string;
        }[];
      }
    | ({ errors?: undefined } & UtilisationReportResponseBody[]);
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
    const response: CustomResponse = await api.get(getUrl('invalid-id'));

    // Assert
    expect(response.status).toEqual(400);

    expect(response.body.errors?.at(0)?.msg).toEqual('The bank id provided should be a string of numbers');
  });

  it('gets utilisation reports', async () => {
    // Arrange
    const bankId = '13';
    const uploadedReport: UtilisationReportEntity = { ...anUploadedUtilisationReportEntity(), bankId };
    const nonUploadedReport: UtilisationReportEntity = { ...aNonUploadedUtilisationReportEntity(), bankId };
    await saveReportToDatabase(uploadedReport);
    await saveReportToDatabase(nonUploadedReport);

    // Act
    const response: CustomResponse = await api.get(getUrl(bankId));

    // Assert
    expect(response.status).toEqual(200);
    expect((response.body as UtilisationReportResponseBody[]).length).toEqual(2);
  });

  it('gets uploaded utilisation reports when excludeNotUploaded query param is true', async () => {
    // Arrange
    const bankId = '13';
    const uploadedReport: UtilisationReportEntity = { ...anUploadedUtilisationReportEntity(), bankId };
    const nonUploadedReport: UtilisationReportEntity = { ...aNonUploadedUtilisationReportEntity(), bankId };
    const nonUploadedMarkedCompleteReport: UtilisationReportEntity = { ...aNonUploadedMarkedCompletedUtilisationReportEntity(), bankId };
    const { id: idOfUploadedReport } = await saveReportToDatabase(uploadedReport);
    await saveReportToDatabase(nonUploadedReport);
    await saveReportToDatabase(nonUploadedMarkedCompleteReport);

    // Act
    const response: CustomResponse = await api.get(`${getUrl(bankId)}?excludeNotUploaded=true`);

    // Assert
    expect(response.status).toEqual(200);
    expect((response.body as UtilisationReportResponseBody[]).length).toEqual(1);
    expect((response.body as UtilisationReportResponseBody[])[0].id).toEqual(idOfUploadedReport);
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
    const urlWithQueryParams = axios.getUri({ url: getUrl(bankId), params: { reportPeriod, excludeNotUploaded: true } });
    const response: CustomResponse = await api.get(urlWithQueryParams);

    // Assert
    expect(response.status).toEqual(200);
    expect((response.body as UtilisationReportResponseBody[]).length).toEqual(1);
    expect((response.body as UtilisationReportResponseBody[])[0].id).toEqual(idOfReportForReportPeriod);
  }, 10000);
});
