import { HttpStatusCode } from 'axios';
import { Currency, FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { withSqlIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { wipe } from '../../wipeDB';
import { aPortalUser, aTfmUser, aTfmSessionUser } from '../../../test-helpers/test-data';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:reportId/payment/:paymentId';

describe(`DELETE ${BASE_URL}`, () => {
  const getUrl = (reportId: number | string, paymentId: number | string) =>
    BASE_URL.replace(':reportId', reportId.toString()).replace(':paymentId', paymentId.toString());

  const reportId = 1;

  const portalUser = aPortalUser();
  const portalUserId = portalUser._id.toString();

  const tfmUser = aTfmUser();
  const tfmUserId = tfmUser._id.toString();

  const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).withUploadedByUserId(portalUserId).build();

  const paymentCurrency: Currency = 'GBP';
  const paymentId = 123;
  const payment = PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(paymentId).build();

  const feeRecordIds = [1, 2];
  const feeRecords = feeRecordIds.map((id) =>
    FeeRecordEntityMockBuilder.forReport(report).withId(id).withStatus('MATCH').withPaymentCurrency(paymentCurrency).withPayments([payment]).build(),
  );
  report.feeRecords = feeRecords;

  const aDeletePaymentRequestBody = () => ({
    user: {
      ...aTfmSessionUser(),
      _id: tfmUserId,
    },
  });

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    await wipe(['users', 'tfm-users']);

    const usersCollection = await mongoDbClient.getCollection('users');
    await usersCollection.insertOne(portalUser);

    const tfmUsersCollection = await mongoDbClient.getCollection('tfm-users');
    await tfmUsersCollection.insertOne(tfmUser);
  });

  beforeEach(async () => {
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await wipe(['users', 'tfm-users']);
  });

  withSqlIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url) => testApi.remove(aDeletePaymentRequestBody()).to(url),
  });

  it('returns a 200 when payment can be deleted', async () => {
    // Act
    const response = await testApi.remove(aDeletePaymentRequestBody()).to(getUrl(reportId, paymentId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);
  });

  it("returns a 400 when the 'user' object is an empty object", async () => {
    // Arrange
    const requestBody = {
      user: {},
    };

    // Act
    const response = await testApi.remove(requestBody).to(getUrl(reportId, paymentId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it('returns a 404 when the report with the supplied id cannot be found', async () => {
    // Arrange
    const invalidReportId = reportId + 1;

    // Act
    const response = await testApi.remove(aDeletePaymentRequestBody()).to(getUrl(invalidReportId, paymentId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.NotFound);
  });

  it('returns a 404 when the payment with the id cannot be found', async () => {
    // Arrange
    const invalidPaymentId = paymentId + 1;

    // Act
    const response = await testApi.remove(aDeletePaymentRequestBody()).to(getUrl(reportId, invalidPaymentId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.NotFound);
  });
});
