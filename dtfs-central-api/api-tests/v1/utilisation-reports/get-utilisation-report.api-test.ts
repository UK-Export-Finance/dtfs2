import { Response } from 'supertest';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { AzureFileInfo, IsoDateTimeStamp, ReportPeriod, UtilisationReportEntity, UtilisationReportReconciliationStatus } from '@ukef/dtfs2-common';
import app from '../../../src/createApp';
import apiModule from '../../api';
import { anUploadedUtilisationReportEntity } from '../../mocks/entities/utilisation-report-entity';

const api = apiModule(app);
const getUrl = (id: string) => `/v1/utilisation-reports/${id}`;

const givenUploadedReport = async (): Promise<string> => {
  const uploadedReport = anUploadedUtilisationReportEntity();
  const savedReport = await SqlDbDataSource.getRepository(UtilisationReportEntity).save(uploadedReport);
  return savedReport.id.toString();
};

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
    | ({ errors?: undefined } & UtilisationReportResponseBody);
}

describe('/v1/utilisation-reports/:id', () => {
  beforeAll(async () => {
    await SqlDbDataSource.initialize();
  });

  describe('GET /v1/utilisation-reports/:id', () => {
    it('returns 400 when an invalid report ID is provided', async () => {
      // Act
      const response: CustomResponse = await api.get(getUrl('invalid-id'));

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.errors?.at(0)?.msg).toEqual("Invalid 'id' path param provided");
    });

    it('gets a utilisation report', async () => {
      // Arrange
      const id = await givenUploadedReport();

      // Act
      const { status } = await api.get(getUrl(id));

      // Assert
      expect(status).toEqual(200);
    });
  });
});
