import { Response } from 'supertest';
import { ObjectId } from 'mongodb';
import { IsoDateTimeStamp, PortalUser, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { withSqlIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { testApi } from '../../test-api';
import { GetUtilisationReportResponse } from '../../../src/types/utilisation-reports';
import { SqlDbHelper } from '../../sql-db-helper';
import { wipe } from '../../wipeDB';
import { mongoDbClient } from '../../../src/drivers/db-client';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:id';

const getUrl = (id: string) => BASE_URL.replace(':id', id);

type UtilisationReportResponse = GetUtilisationReportResponse & {
  dateUploaded: IsoDateTimeStamp;
};

interface CustomResponse extends Response {
  body: UtilisationReportResponse;
}

describe(`GET ${BASE_URL}`, () => {
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

  withSqlIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url) => testApi.get(url),
  });

  it('gets a utilisation report', async () => {
    // Arrange
    const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').withUploadedByUserId(portalUserId).build();
    const { id } = await SqlDbHelper.saveNewEntry('UtilisationReport', uploadedReport);

    // Act
    const response: CustomResponse = await testApi.get(getUrl(id.toString()));

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body.id).toEqual(id);
  });
});
