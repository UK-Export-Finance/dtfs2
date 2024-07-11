import httpMocks from 'node-mocks-http';
import { HttpStatusCode, AxiosError, AxiosResponse } from 'axios';
import api from '../../api';
import {
  PostRemoveFeesFromPaymentRequest,
  PostRemoveFeesFromPaymentRequestBody,
  PostRemoveFeesFromPaymentRequestParams,
  postRemoveFeesFromPayment,
} from './post-remove-fees-from-payment.controller';
import { aTfmSessionUser } from '../../../../test-helpers';

jest.mock('../../api');

console.error = jest.fn();

describe('postRemoveFeesFromPayment', () => {
  const reportId = '1';
  const paymentId = '2';
  const selectedFeeRecordIds = [1, 2, 3];
  const user = aTfmSessionUser();

  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    jest.mocked(api.removeFeesFromPayment).mockResolvedValue();
  });

  const aPostRemoveFeesFromPaymentRequestBody = (): PostRemoveFeesFromPaymentRequestBody => ({
    selectedFeeRecordIds,
    user,
  });

  const aPostRemoveFeesFromPaymentRequestParams = (): PostRemoveFeesFromPaymentRequestParams => ({ reportId, paymentId });

  const getHttpMocks = () =>
    httpMocks.createMocks<PostRemoveFeesFromPaymentRequest>({
      body: aPostRemoveFeesFromPaymentRequestBody(),
      params: aPostRemoveFeesFromPaymentRequestParams(),
    });

  it('removes fee records from the payment', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postRemoveFeesFromPayment(req, res);

    // Assert
    expect(api.removeFeesFromPayment).toHaveBeenCalledTimes(1);
    expect(api.removeFeesFromPayment).toHaveBeenCalledWith(reportId, paymentId, selectedFeeRecordIds, user);
  });

  it('responds with a 200', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postRemoveFeesFromPayment(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
    expect(res._isEndCalled()).toBe(true);
  });

  it('responds with a 500 if an unknown error occurs', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    jest.mocked(api.removeFeesFromPayment).mockRejectedValue(new Error('Some error'));

    // Act
    await postRemoveFeesFromPayment(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
    expect(res._isEndCalled()).toBe(true);
  });

  it('responds with a specific error code if an axios error is thrown', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    const errorStatus = HttpStatusCode.BadRequest;
    const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

    jest.mocked(api.removeFeesFromPayment).mockRejectedValue(axiosError);

    // Act
    await postRemoveFeesFromPayment(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(errorStatus);
    expect(res._isEndCalled()).toBe(true);
  });

  it('responds with an error message', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    jest.mocked(api.removeFeesFromPayment).mockRejectedValue(new Error('Some error'));

    // Act
    await postRemoveFeesFromPayment(req, res);

    // Assert
    expect(res._getData()).toBe('Failed to remove fees from payment');
    expect(res._isEndCalled()).toBe(true);
  });
});
