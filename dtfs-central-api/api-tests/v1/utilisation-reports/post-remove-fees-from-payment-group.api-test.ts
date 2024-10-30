import { HttpStatusCode } from 'axios';
import {
  Currency,
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { withSqlIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { wipe } from '../../wipeDB';
import { aTfmUser, aTfmSessionUser } from '../../../test-helpers';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:reportId/payment/:paymentId/remove-selected-fees';

describe(`POST ${BASE_URL}`, () => {
  const getUrl = (reportId: number | string, paymentId: number | string) =>
    BASE_URL.replace(':reportId', reportId.toString()).replace(':paymentId', paymentId.toString());

  const reportId = 1;

  const tfmUser = aTfmUser();
  const tfmUserId = tfmUser._id.toString();

  const report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS).withId(reportId).build();

  const paymentCurrency: Currency = 'GBP';
  const paymentId = 2;
  const payment = PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(paymentId).build();

  const feeRecordIds = [1, 2];
  const feeRecords = feeRecordIds.map((id) =>
    FeeRecordEntityMockBuilder.forReport(report)
      .withId(id)
      .withStatus(FEE_RECORD_STATUS.MATCH)
      .withPaymentCurrency(paymentCurrency)
      .withPayments([payment])
      .build(),
  );
  report.feeRecords = feeRecords;

  const aRemoveFeesFromPaymentGroupRequestBody = () => ({
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

  withSqlIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url) => testApi.post(aRemoveFeesFromPaymentGroupRequestBody()).to(url),
  });

  it('returns a 200 when fees can be removed from the payment', async () => {
    // Act
    const response = await testApi.post(aRemoveFeesFromPaymentGroupRequestBody()).to(getUrl(reportId, paymentId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
  });

  it('returns a 400 when all selectable fee records are selected', async () => {
    // Act
    const paymentRequestBody = {
      ...aRemoveFeesFromPaymentGroupRequestBody(),
      selectedFeeRecordIds: feeRecordIds,
    };
    const response = await testApi.post(paymentRequestBody).to(getUrl(reportId, paymentId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it("returns a 400 when the 'user' object is an empty object", async () => {
    // Arrange
    const requestBody = {
      user: {},
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId, paymentId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it('returns a 404 when the report with the supplied id cannot be found', async () => {
    // Arrange
    const invalidReportId = reportId + 1;

    // Act
    const response = await testApi.post(aRemoveFeesFromPaymentGroupRequestBody()).to(getUrl(invalidReportId, paymentId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it('returns a 404 when the payment with the id cannot be found', async () => {
    // Arrange
    const invalidPaymentId = paymentId + 1;

    // Act
    const response = await testApi.post(aRemoveFeesFromPaymentGroupRequestBody()).to(getUrl(reportId, invalidPaymentId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });
});
