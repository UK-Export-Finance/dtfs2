import { HttpStatusCode } from 'axios';
import {
  CURRENCY,
  Currency,
  FEE_RECORD_STATUS,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  FeeRecordStatus,
  PaymentEntity,
  PaymentEntityMockBuilder,
  PaymentMatchingToleranceEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { withSqlIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { wipe } from '../../wipeDB';
import { aPortalUser, aTfmUser, aTfmSessionUser } from '../../../test-helpers';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:reportId/payment';

describe(`POST ${BASE_URL}`, () => {
  const getUrl = (reportId: number | string) => BASE_URL.replace(':reportId', reportId.toString());

  const reportId = 1;

  const portalUser = aPortalUser();
  const portalUserId = portalUser._id.toString();

  const tfmUser = aTfmUser();
  const tfmUserId = tfmUser._id.toString();

  const uploadedUtilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
    .withId(reportId)
    .withUploadedByUserId(portalUserId)
    .build();

  const paymentCurrency: Currency = 'GBP';

  const feeRecordIds = [1, 2];
  const feeRecords = feeRecordIds.map((id) =>
    FeeRecordEntityMockBuilder.forReport(uploadedUtilisationReport).withId(id).withPaymentCurrency(paymentCurrency).build(),
  );
  uploadedUtilisationReport.feeRecords = feeRecords;

  const aValidRequestBody = () => ({
    user: {
      ...aTfmSessionUser(),
      _id: tfmUserId,
    },
    feeRecordIds,
    paymentCurrency,
    paymentAmount: 100,
    datePaymentReceived: new Date('2024-01-01').toISOString(),
    paymentReference: 'A payment reference',
  });

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await SqlDbHelper.deleteAllEntries('PaymentMatchingTolerance');

    const tolerances = [
      PaymentMatchingToleranceEntityMockBuilder.forCurrency('GBP').withId(1).withThreshold(1).withIsActive(true).build(),
      PaymentMatchingToleranceEntityMockBuilder.forCurrency('EUR').withId(2).withThreshold(2).withIsActive(true).build(),
      PaymentMatchingToleranceEntityMockBuilder.forCurrency('JPY').withId(3).withThreshold(3).withIsActive(true).build(),
      PaymentMatchingToleranceEntityMockBuilder.forCurrency('USD').withId(4).withThreshold(4).withIsActive(true).build(),
    ];
    await SqlDbHelper.saveNewEntries('PaymentMatchingTolerance', tolerances);

    await SqlDbHelper.saveNewEntry('UtilisationReport', uploadedUtilisationReport);

    await wipe(['users', 'tfm-users']);

    const usersCollection = await mongoDbClient.getCollection('users');
    await usersCollection.insertOne(portalUser);

    const tfmUsersCollection = await mongoDbClient.getCollection('tfm-users');
    await tfmUsersCollection.insertOne(tfmUser);
  });

  beforeEach(async () => {
    await SqlDbHelper.saveNewEntry('UtilisationReport', uploadedUtilisationReport);
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
    makeRequest: (url) => testApi.post(aValidRequestBody()).to(url),
  });

  it(`should respond with a ${HttpStatusCode.Ok} with a valid request body`, async () => {
    // Arrange
    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
  });

  it(`should respond with a ${HttpStatusCode.BadRequest} when the 'feeRecordIds' array is empty`, async () => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      feeRecordIds: [],
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should respond with a ${HttpStatusCode.BadRequest} when the 'user' object is an empty object`, async () => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      user: {},
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it.each(Object.values(CURRENCY))(`should respond with a ${HttpStatusCode.Ok} when 'paymentCurrency' is '%s'`, async (currency) => {
    // Arrange
    await SqlDbHelper.deleteAllEntries('Payment');
    await SqlDbHelper.deleteAllEntries('FeeRecord');

    const feeRecordsWithTestCurrency = feeRecordIds.map((id) =>
      FeeRecordEntityMockBuilder.forReport(uploadedUtilisationReport).withId(id).withPaymentCurrency(currency).build(),
    );
    await SqlDbHelper.saveNewEntries('FeeRecord', feeRecordsWithTestCurrency);

    const requestBody = {
      ...aValidRequestBody(),
      paymentCurrency: currency,
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
  });

  it(`should respond with a ${HttpStatusCode.BadRequest} when the 'paymentCurrency' is not a valid currency`, async () => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      paymentCurrency: 'invalid currency',
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should respond with a ${HttpStatusCode.BadRequest} when the 'feeRecordIds' array is empty`, async () => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      feeRecordIds: [],
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should respond with a ${HttpStatusCode.BadRequest} when the 'paymentAmount' is less than zero`, async () => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      paymentAmount: -1,
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should respond with a ${HttpStatusCode.BadRequest} when the 'paymentAmount' is less than zero`, async () => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      paymentAmount: -1,
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should respond with a ${HttpStatusCode.BadRequest} when the 'datePaymentReceived' cannot be coerced to a 'Date' object`, async () => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      datePaymentReceived: 'some invalid date',
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should respond with a ${HttpStatusCode.Ok} when the 'paymentReference' is undefined`, async () => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      paymentReference: undefined,
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
  });

  it(`should respond with a ${HttpStatusCode.BadRequest} when the new payment currency does not match the existing fee record currency`, async () => {
    // Arrange
    await SqlDbHelper.deleteAllEntries('Payment');
    await SqlDbHelper.deleteAllEntries('FeeRecord');

    const feeRecordsInGBP = feeRecordIds.map((id) =>
      FeeRecordEntityMockBuilder.forReport(uploadedUtilisationReport).withId(id).withPaymentCurrency('GBP').build(),
    );
    await SqlDbHelper.saveNewEntries('FeeRecord', feeRecordsInGBP);

    const requestBodyWithEURPaymentCurrency = {
      ...aValidRequestBody(),
      paymentCurrency: 'EUR',
    };

    // Act
    const response = await testApi.post(requestBodyWithEURPaymentCurrency).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should respond with a ${HttpStatusCode.BadRequest} when the selected fee record ids do not match those in the existing fee record payment group`, async () => {
    // Arrange
    await SqlDbHelper.deleteAllEntries('Payment');
    await SqlDbHelper.deleteAllEntries('FeeRecord');

    const selectedFeeRecordIds = [1, 2];
    const paymentFeeRecordIds = [1, 2, 3];

    const feeRecordsWithPayments = paymentFeeRecordIds.map((feeRecordId) =>
      FeeRecordEntityMockBuilder.forReport(uploadedUtilisationReport)
        .withId(feeRecordId)
        .withPaymentCurrency('GBP')
        .withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH)
        .build(),
    );

    const payments = [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withFeeRecords(feeRecordsWithPayments).build()];

    await SqlDbHelper.saveNewEntries('Payment', payments);

    const requestBodyWithPartialFeeRecordIds = {
      ...aValidRequestBody(),
      feeRecordIds: selectedFeeRecordIds,
    };

    // Act
    const response = await testApi.post(requestBodyWithPartialFeeRecordIds).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it('adds a new payment to the fee record when the fee record already has payments', async () => {
    // Arrange
    const feeRecordId = 10;
    const existingPaymentReference = 'First payment';
    const existingPayment = PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(feeRecordId).withReference(existingPaymentReference).build();
    const newFeeRecord = FeeRecordEntityMockBuilder.forReport(uploadedUtilisationReport)
      .withId(10)
      .withPaymentCurrency(paymentCurrency)
      .withPayments([existingPayment])
      .build();

    await SqlDbHelper.saveNewEntry('FeeRecord', newFeeRecord);

    const newPaymentReference = 'Second payment';
    const requestBody = {
      ...aValidRequestBody(),
      feeRecordIds: [feeRecordId],
      paymentCurrency,
      paymentAmount: 10,
      datePaymentReceived: new Date('2024-02-01').toISOString(),
      paymentReference: newPaymentReference,
    };

    // Act
    await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    const feeRecordWithPayments = await SqlDbHelper.manager.findOne(FeeRecordEntity, {
      where: { id: feeRecordId },
      relations: { payments: true },
    });
    const { payments } = feeRecordWithPayments!;

    expect(payments).toHaveLength(2);
    expect(payments[0]).toEqual(
      expect.objectContaining<Partial<PaymentEntity>>({
        id: feeRecordId,
        currency: paymentCurrency,
        reference: existingPaymentReference,
      }),
    );
    expect(payments[1]).toEqual(
      expect.objectContaining<Partial<PaymentEntity>>({
        currency: paymentCurrency,
        reference: newPaymentReference,
      }),
    );
  });

  it(`should the fee record status to ${FEE_RECORD_STATUS.DOES_NOT_MATCH} if the new payment plus the existing payments does not match the fee record amounts`, async () => {
    // Arrange
    await SqlDbHelper.deleteAllEntries('Payment');
    await SqlDbHelper.deleteAllEntries('FeeRecord');

    // (100 + 52) - (100 + 50) = 2 > 1 the tolerance for GBP, the payment currency
    const firstFeeRecordAmount = 100;
    const secondFeeRecordAmount = 50;
    const firstPaymentAmount = 52;
    const secondPaymentAmount = 100;

    const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(uploadedUtilisationReport)
      .withId(1)
      .withPaymentCurrency(paymentCurrency)
      .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
      .withFeesPaidToUkefForThePeriod(firstFeeRecordAmount)
      .build();
    const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(uploadedUtilisationReport)
      .withId(2)
      .withPaymentCurrency(paymentCurrency)
      .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
      .withFeesPaidToUkefForThePeriod(secondFeeRecordAmount)
      .build();

    const firstPayment = PaymentEntityMockBuilder.forCurrency(paymentCurrency)
      .withAmount(firstPaymentAmount)
      .withFeeRecords([firstFeeRecord, secondFeeRecord])
      .build();

    await SqlDbHelper.saveNewEntry('Payment', firstPayment);

    const requestBody = {
      ...aValidRequestBody(),
      paymentCurrency,
      paymentAmount: secondPaymentAmount,
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    const feeRecordsWithPayments = await SqlDbHelper.manager.find(FeeRecordEntity, {
      relations: { payments: true },
    });
    expect(feeRecordsWithPayments).toHaveLength(2);
    feeRecordsWithPayments.forEach((feeRecord) => {
      expect(feeRecord.payments).toHaveLength(2);
      expect(feeRecord.status).toEqual<FeeRecordStatus>(FEE_RECORD_STATUS.DOES_NOT_MATCH);
    });
    expect(response.body).toEqual({ feeRecordStatus: FEE_RECORD_STATUS.DOES_NOT_MATCH });
  });

  it(`should set the fee record status to ${FEE_RECORD_STATUS.MATCH} if the new payment plus the existing payments match the fee record amount`, async () => {
    // Arrange
    await SqlDbHelper.deleteAllEntries('Payment');
    await SqlDbHelper.deleteAllEntries('FeeRecord');

    // (120 + 30.5) - (100 + 50) = 0.5 < 1 the tolerance for GBP, the payment currency
    const firstFeeRecordAmount = 100;
    const secondFeeRecordAmount = 50;
    const firstPaymentAmount = 30.5;
    const secondPaymentAmount = 120;

    const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(uploadedUtilisationReport)
      .withId(1)
      .withPaymentCurrency(paymentCurrency)
      .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
      .withFeesPaidToUkefForThePeriod(firstFeeRecordAmount)
      .build();
    const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(uploadedUtilisationReport)
      .withId(2)
      .withPaymentCurrency(paymentCurrency)
      .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
      .withFeesPaidToUkefForThePeriod(secondFeeRecordAmount)
      .build();

    const firstPayment = PaymentEntityMockBuilder.forCurrency(paymentCurrency)
      .withAmount(firstPaymentAmount)
      .withFeeRecords([firstFeeRecord, secondFeeRecord])
      .build();

    await SqlDbHelper.saveNewEntry('Payment', firstPayment);

    const requestBody = {
      ...aValidRequestBody(),
      paymentCurrency,
      paymentAmount: secondPaymentAmount,
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    const feeRecordsWithPayments = await SqlDbHelper.manager.find(FeeRecordEntity, {
      relations: { payments: true },
    });
    expect(feeRecordsWithPayments).toHaveLength(2);
    feeRecordsWithPayments.forEach((feeRecord) => {
      expect(feeRecord.payments).toHaveLength(2);
      expect(feeRecord.status).toEqual<FeeRecordStatus>(FEE_RECORD_STATUS.MATCH);
    });
    expect(response.body).toEqual({ feeRecordStatus: FEE_RECORD_STATUS.MATCH });
  });
});
