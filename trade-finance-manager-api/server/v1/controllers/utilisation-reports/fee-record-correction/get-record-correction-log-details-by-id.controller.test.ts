import { recordCorrectionLogDetailsMock } from '@ukef/dtfs2-common/test-helpers';
import httpMocks from 'node-mocks-http';
import { AxiosResponse, HttpStatusCode, AxiosError } from 'axios';
import { Request } from 'express';
import { GetRecordCorrectionLogDetailsResponseBody } from '@ukef/dtfs2-common';
import { getRecordCorrectionLogDetailsById } from './get-record-correction-log-details-by-id.controller';
import api from '../../../api';

console.error = jest.fn();

jest.mock('../../../api');

describe('get-record-correction-log-details-by-id.contoller', () => {
  const correctionId = '1';

  const getHttpMocks = () =>
    httpMocks.createMocks<Request>({
      params: { correctionId },
    });

  const aResponseBody = (): GetRecordCorrectionLogDetailsResponseBody => ({
    ...recordCorrectionLogDetailsMock,
  });

  const getRecordCorrectionLogDetailsSpy = jest.spyOn(api, 'getRecordCorrectionLogDetailsById');

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when the api request is successful', () => {
    const responseBody = aResponseBody();

    beforeEach(() => {
      getRecordCorrectionLogDetailsSpy.mockResolvedValue(responseBody);
    });

    it(`should return a ${HttpStatusCode.Ok} status code if the api request is successful`, async () => {
      const { req, res } = getHttpMocks();

      jest.mocked(api.getRecordCorrectionLogDetailsById).mockResolvedValue(responseBody);

      // Act
      await getRecordCorrectionLogDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(responseBody);
    });

    it('should call the "getRecordCorrectionLogDetailsById" api endpoint once', async () => {
      const { req, res } = getHttpMocks();

      // Act
      await getRecordCorrectionLogDetailsById(req, res);

      // Assert
      expect(getRecordCorrectionLogDetailsSpy).toHaveBeenCalledTimes(1);
      expect(getRecordCorrectionLogDetailsSpy).toHaveBeenCalledWith(correctionId);
    });
  });

  it(`should return a ${HttpStatusCode.InternalServerError} status code if an unknown error occurs`, async () => {
    // Arrange
    jest.mocked(api.getRecordCorrectionLogDetailsById).mockRejectedValue(new Error('Some error'));
    const { req, res } = getHttpMocks();

    // Act
    await getRecordCorrectionLogDetailsById(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    expect(res._isEndCalled()).toEqual(true);
  });

  it('should return a specific error code if an axios error is thrown', async () => {
    const { req, res } = getHttpMocks();

    // Arrange
    const errorStatus = HttpStatusCode.BadRequest;
    const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

    jest.mocked(api.getRecordCorrectionLogDetailsById).mockRejectedValue(axiosError);

    // Act
    await getRecordCorrectionLogDetailsById(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(errorStatus);
    expect(res._isEndCalled()).toEqual(true);
  });

  it('should return an error message if an error occurs', async () => {
    const { req, res } = getHttpMocks();

    // Arrange
    jest.mocked(api.getRecordCorrectionLogDetailsById).mockRejectedValue(new Error('Some error'));

    // Act
    await getRecordCorrectionLogDetailsById(req, res);

    // Assert
    expect(res._getData()).toEqual('Failed to get record correction log details');
    expect(res._isEndCalled()).toEqual(true);
  });
});
