import { Response } from 'supertest';
import { IsoDateTimeStamp, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import app from '../../../src/createApp';
import apiModule from '../../api';
import { GetUtilisationReportResponse } from '../../../src/types/utilisation-reports';
import { SqlDbHelper } from '../../sql-db-helper';

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
    await SqlDbHelper.initialize();
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
      const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
      const { id } = await SqlDbHelper.saveNewEntry('UtilisationReport', uploadedReport);

      // Act
      const response: CustomSuccessResponse = await api.get(getUrl(id.toString()));

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.id).toEqual(id);
    });
  });
});
