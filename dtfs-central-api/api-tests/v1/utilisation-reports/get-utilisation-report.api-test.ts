import { Response } from 'supertest';
import { ObjectId } from 'mongodb';
import { IsoDateTimeStamp, PortalUser, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { testApi } from '../../test-api';
import { GetUtilisationReportResponse } from '../../../src/types/utilisation-reports';
import { SqlDbHelper } from '../../sql-db-helper';
import { wipe } from '../../wipeDB';
import { mongoDbClient } from '../../../src/drivers/db-client';

console.error = jest.fn();

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

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await wipe(['users']);
  });

  describe('GET /v1/utilisation-reports/:id', () => {
    it('returns 400 when an invalid report ID is provided', async () => {
      // Act
      const response: CustomErrorResponse = await testApi.get(getUrl('invalid-id'));

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.errors[0]?.msg).toEqual("Invalid 'id' path param provided");
    });

    it('gets a utilisation report', async () => {
      // Arrange
      const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').withUploadedByUserId(portalUserId).build();
      const { id } = await SqlDbHelper.saveNewEntry('UtilisationReport', uploadedReport);

      // Act
      const response: CustomSuccessResponse = await testApi.get(getUrl(id.toString()));

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.id).toEqual(id);
    });
  });
});
