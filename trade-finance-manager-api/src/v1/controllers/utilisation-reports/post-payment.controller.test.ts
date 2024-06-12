import httpMocks from 'node-mocks-http';
import { HttpStatusCode, AxiosError, AxiosResponse } from 'axios';
import { Currency } from '@ukef/dtfs2-common';
import api from '../../api';
import { PostPaymentRequest, PostPaymentRequestBody, PostPaymentRequestParams, postPayment } from './post-payment.controller';
import { aTfmSessionUser } from '../../../../test-helpers/tfm-session-user';

jest.mock('../../api');

console.error = jest.fn();

describe('postPayment', () => {
  const reportId = '1';
  const feeRecordIds = [1, 2, 3];
  const user = aTfmSessionUser();
  const paymentCurrency: Currency = 'GBP';
  const paymentAmount = 123.45;
  const datePaymentReceived = new Date().toISOString();
  const paymentReference = 'A payment reference';

  const aPostPaymentRequestBody = (): PostPaymentRequestBody => ({
    feeRecordIds,
    paymentCurrency,
    paymentAmount,
    datePaymentReceived,
    paymentReference,
    user,
  });

  const aPostPaymentRequestParams = (): PostPaymentRequestParams => ({ reportId });

  const getHttpMocks = () =>
    httpMocks.createMocks<PostPaymentRequest>({
      body: aPostPaymentRequestBody(),
      params: aPostPaymentRequestParams(),
    });

  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    jest.mocked(api.addPaymentToFeeRecords).mockResolvedValue({});
  });

  it('adds a payment to the fee records', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postPayment(req, res);

    // Assert
    expect(api.addPaymentToFeeRecords).toHaveBeenCalledTimes(1);
    expect(api.addPaymentToFeeRecords).toHaveBeenCalledWith(
      reportId,
      feeRecordIds,
      user,
      paymentCurrency,
      paymentAmount,
      datePaymentReceived,
      paymentReference,
    );
  });

  it('responds with a 200', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postPayment(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
    expect(res._isEndCalled()).toBe(true);
  });

  it('responds with a 500 if an unknown error occurs', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    jest.mocked(api.addPaymentToFeeRecords).mockRejectedValue(new Error('Some error'));

    // Act
    await postPayment(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
    expect(res._isEndCalled()).toBe(true);
  });

  it('responds with a specific error code if an axios error is thrown', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    const errorStatus = HttpStatusCode.BadRequest;
    const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

    jest.mocked(api.addPaymentToFeeRecords).mockRejectedValue(axiosError);

    // Act
    await postPayment(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(errorStatus);
    expect(res._isEndCalled()).toBe(true);
  });

  it('responds with an error message', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    jest.mocked(api.addPaymentToFeeRecords).mockRejectedValue(new Error('Some error'));

    // Act
    await postPayment(req, res);

    // Assert
    expect(res._getData()).toBe('Failed to add payment');
    expect(res._isEndCalled()).toBe(true);
  });
});
