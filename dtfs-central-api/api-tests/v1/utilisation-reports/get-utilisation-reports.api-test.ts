import { Response } from 'supertest';
import {
  IsoDateTimeStamp,
  PENDING_RECONCILIATION,
  PortalUser,
  RECONCILIATION_COMPLETED,
  REPORT_NOT_RECEIVED,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import axios from 'axios';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { GetUtilisationReportResponse } from '../../../server/types/utilisation-reports';
import { mongoDbClient } from '../../../server/drivers/db-client';
import { wipe } from '../../wipeDB';
import { aPortalUser } from '../../../test-helpers';
import { CustomErrorResponse } from '../../helpers/custom-error-response';

console.error = jest.fn();

const saveReportsToDatabase = async (...reports: UtilisationReportEntity[]): Promise<UtilisationReportEntity[]> =>
  await SqlDbHelper.saveNewEntries('UtilisationReport', reports);

type UtilisationReportResponse = GetUtilisationReportResponse & {
  dateUploaded: IsoDateTimeStamp;
};

interface CustomSuccessResponse extends Response {
  body: UtilisationReportResponse[];
}

const BASE_URL = '/v1/bank/:bankId/utilisation-reports';

describe(`GET ${BASE_URL}`, () => {
  const getUrl = (bankId: string) => `/v1/bank/${bankId}/utilisation-reports`;

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
    const response: CustomErrorResponse = await testApi.get(getUrl('invalid-id'));

    // Assert
    expect(response.status).toEqual(400);

    expect(response.body.errors[0]?.msg).toEqual('The bank id provided should be a string of numbers');
  });

  it('gets utilisation reports', async () => {
    // Arrange
    const bankId = '13';

    const uploadedReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION)
      .withId(1)
      .withBankId(bankId)
      .withUploadedByUserId(portalUserId)
      .build();

    const nonUploadedReport = UtilisationReportEntityMockBuilder.forStatus(REPORT_NOT_RECEIVED).withId(2).withBankId(bankId).build();

    await saveReportsToDatabase(uploadedReport, nonUploadedReport);

    // Act
    const response: CustomSuccessResponse = await testApi.get(getUrl(bankId));

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(2);
  });

  it(`gets only the utilisation reports which are not in the ${REPORT_NOT_RECEIVED} when the excludeNotReceived query param is set to true`, async () => {
    // Arrange
    const bankId = '13';

    const uploadedReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION)
      .withId(1)
      .withBankId(bankId)
      .withUploadedByUserId(portalUserId)
      .build();

    const notReceivedReport = UtilisationReportEntityMockBuilder.forStatus(REPORT_NOT_RECEIVED).withId(2).withBankId(bankId).build();

    const reconciliationCompletedReport = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_COMPLETED)
      .withId(3)
      .withBankId(bankId)
      .withUploadedByUserId(portalUserId)
      .build();

    await saveReportsToDatabase(uploadedReport, notReceivedReport, reconciliationCompletedReport);

    // Act
    const response: CustomSuccessResponse = await testApi.get(`${getUrl(bankId)}?excludeNotReceived=true`);

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(2);
    const ids = response.body.map((report) => report.id);
    expect(ids).toContain(uploadedReport.id);
    expect(ids).toContain(reconciliationCompletedReport.id);
  });

  it('gets utilisation reports for specified period', async () => {
    // Arrange
    const bankId = '13';
    const reportPeriod = {
      start: { month: 11, year: 2021 },
      end: { month: 12, year: 2021 },
    };

    const uploadedReportForReportPeriod = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION)
      .withId(1)
      .withBankId(bankId)
      .withReportPeriod(reportPeriod)
      .withUploadedByUserId(portalUserId)
      .build();

    const uploadedReportForDifferentReportPeriod = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION)
      .withId(2)
      .withBankId(bankId)
      .withReportPeriod({ start: { month: 1, year: 2022 }, end: { month: 2, year: 2022 } })
      .withUploadedByUserId(portalUserId)
      .build();

    await saveReportsToDatabase(uploadedReportForReportPeriod, uploadedReportForDifferentReportPeriod);

    // Act
    const urlWithQueryParams = axios.getUri({ url: getUrl(bankId), params: { reportPeriod } });
    const response: CustomSuccessResponse = await testApi.get(urlWithQueryParams);

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(1);
    expect(response.body[0].id).toEqual(uploadedReportForReportPeriod.id);
  });

  it(`returns no reports when the excludeNotReceived query is true but the report for the specified report period is in the ${REPORT_NOT_RECEIVED} state`, async () => {
    // Arrange
    const bankId = '13';
    const reportPeriod = {
      start: { month: 11, year: 2021 },
      end: { month: 12, year: 2021 },
    };

    const notReceivedReportForReportPeriod = UtilisationReportEntityMockBuilder.forStatus(REPORT_NOT_RECEIVED)
      .withId(1)
      .withBankId(bankId)
      .withReportPeriod(reportPeriod)
      .build();

    const uploadedReportForDifferentReportPeriod = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION)
      .withId(2)
      .withBankId(bankId)
      .withReportPeriod({ start: { month: 1, year: 2022 }, end: { month: 2, year: 2022 } })
      .withUploadedByUserId(portalUserId)
      .build();

    await saveReportsToDatabase(notReceivedReportForReportPeriod, uploadedReportForDifferentReportPeriod);

    // Act
    const urlWithQueryParams = axios.getUri({
      url: getUrl(bankId),
      params: { reportPeriod, excludeNotReceived: true },
    });
    const response: CustomSuccessResponse = await testApi.get(urlWithQueryParams);

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(0);
  });
});
