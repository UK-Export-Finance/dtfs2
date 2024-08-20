import httpMocks from 'node-mocks-http';
import { HttpStatusCode, AxiosError, AxiosResponse } from 'axios';
import api from '../../api';
import {
  PostFeesToAnExistingPaymentRequest,
  PostFeesToAnExistingPaymentRequestBody,
  PostFeesToAnExistingPaymentRequestParams,
  postFeesToAnExistingPayment,
} from './post-fees-to-an-existing-payment.controller';
import { aTfmSessionUser } from '../../../../test-helpers';

jest.mock('../../api');

console.error = jest.fn();

describe('postFeesToAnExistingPayment', () => {
  const reportId = '1';
  const feeRecordIds = [1, 2, 3];
  const paymentIds = [7, 8];
  const user = aTfmSessionUser();

  const aPostFeesToAnExistingPaymentRequestBody = (): PostFeesToAnExistingPaymentRequestBody => ({
    feeRecordIds,
    paymentIds,
    user,
  });

  const aPostFeesToAnExistingPaymentRequestParams = (): PostFeesToAnExistingPaymentRequestParams => ({ reportId });

  const getHttpMocks = () =>
    httpMocks.createMocks<PostFeesToAnExistingPaymentRequest>({
      body: aPostFeesToAnExistingPaymentRequestBody(),
      params: aPostFeesToAnExistingPaymentRequestParams(),
    });

  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    jest.mocked(api.addFeesToAnExistingPayment).mockResolvedValue(aPostFeesToAnExistingPaymentRequestBody());
  });

  it('adds fee records to the payment', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postFeesToAnExistingPayment(req, res);

    // Assert
    expect(api.addFeesToAnExistingPayment).toHaveBeenCalledTimes(1);
    expect(api.addFeesToAnExistingPayment).toHaveBeenCalledWith(reportId, feeRecordIds, paymentIds, user);
  });

  it('responds with a 200', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postFeesToAnExistingPayment(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
    expect(res._isEndCalled()).toBe(true);
  });

  it('responds with a 500 if an unknown error occurs', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    jest.mocked(api.addFeesToAnExistingPayment).mockRejectedValue(new Error('Some error'));

    // Act
    await postFeesToAnExistingPayment(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
    expect(res._isEndCalled()).toBe(true);
  });

  it('responds with a specific error code if an axios error is thrown', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    const errorStatus = HttpStatusCode.BadRequest;
    const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

    jest.mocked(api.addFeesToAnExistingPayment).mockRejectedValue(axiosError);

    // Act
    await postFeesToAnExistingPayment(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(errorStatus);
    expect(res._isEndCalled()).toBe(true);
  });

  it('responds with an error message when api call fails', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    jest.mocked(api.addFeesToAnExistingPayment).mockRejectedValue(new Error('Some error'));

    // Act
    await postFeesToAnExistingPayment(req, res);

    // Assert
    expect(res._getData()).toBe('Failed to add fees to an existing payment');
    expect(res._isEndCalled()).toBe(true);
  });
});
