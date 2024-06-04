import { Response } from 'supertest';
import { HttpStatusCode } from 'axios';
import {
  CURRENCY,
  Currency,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  FeeRecordStatus,
  PaymentEntity,
  PaymentEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import app from '../../../src/createApp';
import createApi from '../../api';
import { SqlDbHelper } from '../../sql-db-helper';
import mongoDbClient from '../../../src/drivers/db-client';
import { wipe } from '../../wipeDB';
import { aPortalUser } from '../../../test-helpers/test-data/portal-user';
import { aTfmUser } from '../../../test-helpers/test-data/tfm-user';
import { aTfmSessionUser } from '../../../test-helpers/test-data/tfm-session-user';

console.log = jest.fn();
console.error = jest.fn();

const api = createApi(app);

describe('POST /v1/utilisation-reports/:reportId/add-payment', () => {
  const getUrl = (reportId: number | string) => `/v1/utilisation-reports/${reportId}/add-payment`;

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

    await SqlDbHelper.saveNewEntry('UtilisationReport', uploadedUtilisationReport);

    await wipe(['users', 'tfm-users']);

    const usersCollection = await mongoDbClient.getCollection('users');
    await usersCollection.insertOne(portalUser);

    const tfmUsersCollection = await mongoDbClient.getCollection('tfm-users');
    await tfmUsersCollection.insertOne(tfmUser);
  });

  beforeEach(async () => {
    await SqlDbHelper.saveNewEntries('FeeRecord', feeRecords);
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAllJoinTableEntries('fee_record_payments_payment');
    await SqlDbHelper.deleteAllEntries('FeeRecord');
    await SqlDbHelper.deleteAllEntries('Payment');
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await wipe(['users', 'tfm-users']);
  });

  it('returns a 200 with a valid request body', async () => {
    // Arrange
    const requestBody = aValidRequestBody();

    // Act
    const response: Response = await api.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);
  });

  it('returns a 400 when the report id is not a valid id', async () => {
    // Arrange
    const requestBody = aValidRequestBody();

    // Act
    const response: Response = await api.post(requestBody).to(getUrl('invalid-id'));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it("returns a 400 when the 'feeRecordIds' array is empty", async () => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      feeRecordIds: [],
    };

    // Act
    const response: Response = await api.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it("returns a 400 when the 'user' object is an empty object", async () => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      user: {},
    };

    // Act
    const response: Response = await api.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it.each(Object.values(CURRENCY))("returns a 200 when 'paymentCurrency' is '%s'", async (currency) => {
    // Arrange
    await SqlDbHelper.deleteAllJoinTableEntries('fee_record_payments_payment');
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
    const response: Response = await api.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);
  });

  it("returns a 400 when the 'paymentCurrency' is not a valid currency", async () => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      paymentCurrency: 'invalid currency',
    };

    // Act
    const response: Response = await api.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it("returns a 400 when the 'feeRecordIds' array is empty", async () => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      feeRecordIds: [],
    };

    // Act
    const response: Response = await api.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it("returns a 400 when the 'paymentAmount' is less than zero", async () => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      paymentAmount: -1,
    };

    // Act
    const response: Response = await api.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it("returns a 400 when the 'paymentAmount' is less than zero", async () => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      paymentAmount: -1,
    };

    // Act
    const response: Response = await api.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it("returns a 400 when the 'datePaymentReceived' cannot be coerced to a 'Date' object", async () => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      datePaymentReceived: 'some invalid date',
    };

    // Act
    const response: Response = await api.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it("returns a 200 when the 'paymentReference' is undefined", async () => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      paymentReference: undefined,
    };

    // Act
    const response: Response = await api.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);
  });

  it('returns a 400 when the new payment currency does not match the existing fee record currency', async () => {
    // Arrange
    await SqlDbHelper.deleteAllJoinTableEntries('fee_record_payments_payment');
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
    const response: Response = await api.post(requestBodyWithEURPaymentCurrency).to(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it('adds a new payment to the fee record when the fee record already has payments', async () => {
    // Arrange
    const feeRecordId = 10;
    const existingPaymentReference = 'First payment';
    const existingPayment = PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(feeRecordId).withPaymentReference(existingPaymentReference).build();
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
    await api.post(requestBody).to(getUrl(reportId));

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
        paymentReference: existingPaymentReference,
      }),
    );
    expect(payments[1]).toEqual(
      expect.objectContaining<Partial<PaymentEntity>>({
        currency: paymentCurrency,
        paymentReference: newPaymentReference,
      }),
    );
  });

  it("sets the fee record status to 'DOES_NOT_MATCH' if the new payment plus the existing payments does not match the fee record amounts", async () => {
    // Arrange
    await SqlDbHelper.deleteAllJoinTableEntries('fee_record_payments_payment');
    await SqlDbHelper.deleteAllEntries('Payment');
    await SqlDbHelper.deleteAllEntries('FeeRecord');

    const firstFeeRecordAmount = 100;
    const secondFeeRecordAmount = 50;
    const firstPaymentAmount = 30;
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
      .withAmountReceived(firstPaymentAmount)
      .withFeeRecords([firstFeeRecord, secondFeeRecord])
      .build();

    await SqlDbHelper.saveNewEntry('Payment', firstPayment);

    const requestBody = {
      ...aValidRequestBody(),
      paymentCurrency,
      paymentAmount: secondPaymentAmount,
    };

    // Act
    await api.post(requestBody).to(getUrl(reportId));

    // Assert
    const feeRecordsWithPayments = await SqlDbHelper.manager.find(FeeRecordEntity, {
      relations: { payments: true },
    });
    expect(feeRecordsWithPayments).toHaveLength(2);
    feeRecordsWithPayments.forEach((feeRecord) => {
      expect(feeRecord.payments).toHaveLength(2);
      expect(feeRecord.status).toBe<FeeRecordStatus>('DOES_NOT_MATCH');
    });
  });

  it("sets the fee record status to 'MATCH' if the new payment plus the existing payments match the fee record amount", async () => {
    // Arrange
    await SqlDbHelper.deleteAllJoinTableEntries('fee_record_payments_payment');
    await SqlDbHelper.deleteAllEntries('Payment');
    await SqlDbHelper.deleteAllEntries('FeeRecord');

    const firstFeeRecordAmount = 100;
    const secondFeeRecordAmount = 50;
    const firstPaymentAmount = 30;
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
      .withAmountReceived(firstPaymentAmount)
      .withFeeRecords([firstFeeRecord, secondFeeRecord])
      .build();

    await SqlDbHelper.saveNewEntry('Payment', firstPayment);

    const requestBody = {
      ...aValidRequestBody(),
      paymentCurrency,
      paymentAmount: secondPaymentAmount,
    };

    // Act
    await api.post(requestBody).to(getUrl(reportId));

    // Assert
    const feeRecordsWithPayments = await SqlDbHelper.manager.find(FeeRecordEntity, {
      relations: { payments: true },
    });
    expect(feeRecordsWithPayments).toHaveLength(2);
    feeRecordsWithPayments.forEach((feeRecord) => {
      expect(feeRecord.payments).toHaveLength(2);
      expect(feeRecord.status).toBe<FeeRecordStatus>('MATCH');
    });
  });
});
