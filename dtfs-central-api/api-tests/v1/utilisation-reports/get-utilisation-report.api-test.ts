import { Response } from 'supertest';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { IsoDateTimeStamp, UtilisationReportEntity } from '@ukef/dtfs2-common';
import app from '../../../src/createApp';
import apiModule from '../../api';
import { anUploadedUtilisationReportEntity } from '../../mocks/entities/utilisation-report-entity';
import { GetUtilisationReportResponse } from '../../../src/types/utilisation-reports';

const api = apiModule(app);
const getUrl = (id: string) => `/v1/utilisation-reports/${id}`;

type UtilisationReportResponse = GetUtilisationReportResponse & {
  dateUploaded: IsoDateTimeStamp;
};

interface CustomErrorResponse extends Response {
  body: {
    errors: {
      msg: string;
    }[];
  };
}
interface CustomSuccessResponse extends Response {
  body: UtilisationReportResponse;
}

describe('/v1/utilisation-reports/:id', () => {
  beforeAll(async () => {
    await SqlDbDataSource.initialize();
  });

  describe('GET /v1/utilisation-reports/:id', () => {
    it('returns 400 when an invalid report ID is provided', async () => {
      // Act
      const response: CustomErrorResponse = await api.get(getUrl('invalid-id'));

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.errors[0]?.msg).toEqual("Invalid 'id' path param provided");
    });

    it('gets a utilisation report', async () => {
      // Arrange
      const uploadedReport = anUploadedUtilisationReportEntity();
      const { id } = await SqlDbDataSource.getRepository(UtilisationReportEntity).save(uploadedReport);

      // Act
      const response: CustomSuccessResponse = await api.get(getUrl(id.toString()));

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.id).toEqual(id);
    });
  });
});
