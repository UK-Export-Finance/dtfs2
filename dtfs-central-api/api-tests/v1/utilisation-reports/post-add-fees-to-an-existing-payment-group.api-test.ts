import { HttpStatusCode } from 'axios';
import {
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
import { aTfmUser, aTfmSessionUser } from '../../../test-helpers/test-data';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:reportId/add-to-an-existing-payment';

describe(`POST ${BASE_URL}`, () => {
  const getUrl = (reportId: number | string) => BASE_URL.replace(':reportId', reportId.toString());

  const tfmUser = aTfmUser();
  const tfmUserId = tfmUser._id.toString();

  const reportId = 1;
  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS)
    .withId(reportId)
    .build();

  const paymentIds = [3, 4];
  const payments = paymentIds.map((id) => PaymentEntityMockBuilder.forCurrency('GBP').withId(id).withFeeRecords([]).build());

  const aFeeRecordToAdd = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).build();
  const aFeeRecordWithPayments = FeeRecordEntityMockBuilder.forReport(utilisationReport)
    .withId(2)
    .withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH)
    .withPayments(payments)
    .build();

  utilisationReport.feeRecords = [aFeeRecordToAdd, aFeeRecordWithPayments];

  const aPostAddFeesToAnExistingPaymentGroupRequestBody = () => ({
    feeRecordIds: [aFeeRecordToAdd.id],
    paymentIds,
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
    await SqlDbHelper.saveNewEntry('UtilisationReport', utilisationReport);
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
    makeRequest: (url) => testApi.post(aPostAddFeesToAnExistingPaymentGroupRequestBody()).to(url),
  });

  it('returns a 200 when fees can be added to the payment group', async () => {
    // Act
    const response = await testApi.post(aPostAddFeesToAnExistingPaymentGroupRequestBody()).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
  });

  it("returns a 400 when the 'feeRecordIds' list is empty", async () => {
    // Arrange
    const requestBody = {
      ...aPostAddFeesToAnExistingPaymentGroupRequestBody(),
      feeRecordIds: [],
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it("returns a 400 when the 'paymentIds' list is empty", async () => {
    // Arrange
    const requestBody = {
      ...aPostAddFeesToAnExistingPaymentGroupRequestBody(),
      paymentIds: [],
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it("returns a 400 when the 'user' object is an empty object", async () => {
    // Arrange
    const requestBody = {
      user: {},
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it('returns a 404 when no payments with the supplied ids can be found', async () => {
    // Arrange
    const requestBody = {
      ...aPostAddFeesToAnExistingPaymentGroupRequestBody(),
      paymentIds: [90, 91],
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });
});
