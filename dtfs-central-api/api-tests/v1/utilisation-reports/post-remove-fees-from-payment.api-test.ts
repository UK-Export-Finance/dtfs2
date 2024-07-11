import { HttpStatusCode } from 'axios';
import { Currency, FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { wipe } from '../../wipeDB';
import { aTfmUser } from '../../../test-helpers/test-data/tfm-user';
import { aTfmSessionUser } from '../../../test-helpers/test-data/tfm-session-user';

console.error = jest.fn();

describe('POST /v1/utilisation-reports/:reportId/payment/:paymentId/remove-selected-fees', () => {
  const getUrl = (reportId: number | string, paymentId: number | string) => `/v1/utilisation-reports/${reportId}/payment/${paymentId}/remove-selected-fees`;

  const reportId = 1;

  const tfmUser = aTfmUser();
  const tfmUserId = tfmUser._id.toString();

  const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).build();

  const paymentCurrency: Currency = 'GBP';
  const paymentId = 2;
  const payment = PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(paymentId).build();

  const feeRecordIds = [1, 2];
  const feeRecords = feeRecordIds.map((id) =>
    FeeRecordEntityMockBuilder.forReport(report).withId(id).withStatus('MATCH').withPaymentCurrency(paymentCurrency).withPayments([payment]).build(),
  );
  report.feeRecords = feeRecords;

  const aRemoveFeesFromPaymentRequestBody = () => ({
    selectedFeeRecordIds: feeRecordIds.slice(0, 1),
    user: {
      ...aTfmSessionUser(),
      _id: tfmUserId,
    },
  });

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    await wipe(['tfm-users']);

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
    await wipe(['tfm-users']);
  });

  it('returns a 200 when fees can be removed from the payment', async () => {
    // Act
    const response = await testApi.post(aRemoveFeesFromPaymentRequestBody()).to(getUrl(reportId, paymentId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);
  });

  it('returns a 400 when the report id is not a valid id', async () => {
    // Act
    const response = await testApi.post(aRemoveFeesFromPaymentRequestBody()).to(getUrl('invalid-id', paymentId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it('returns a 400 when the payment id is not a valid id', async () => {
    // Act
    const response = await testApi.post(aRemoveFeesFromPaymentRequestBody()).to(getUrl(reportId, 'invalid-id'));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it("returns a 400 when the 'user' object is an empty object", async () => {
    // Arrange
    const requestBody = {
      user: {},
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId, paymentId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it('returns a 404 when the report with the supplied id cannot be found', async () => {
    // Arrange
    const invalidReportId = reportId + 1;

    // Act
    const response = await testApi.post(aRemoveFeesFromPaymentRequestBody()).to(getUrl(invalidReportId, paymentId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.NotFound);
  });

  it('returns a 404 when the payment with the id cannot be found', async () => {
    // Arrange
    const invalidPaymentId = paymentId + 1;

    // Act
    const response = await testApi.post(aRemoveFeesFromPaymentRequestBody()).to(getUrl(reportId, invalidPaymentId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.NotFound);
  });
});
