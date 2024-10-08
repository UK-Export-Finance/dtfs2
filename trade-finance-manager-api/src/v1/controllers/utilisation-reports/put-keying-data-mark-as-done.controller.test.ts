import httpMocks from 'node-mocks-http';
import { AxiosResponse, HttpStatusCode, AxiosError } from 'axios';
import api from '../../api';
import { aTfmSessionUser } from '../../../../test-helpers';
import { putKeyingDataMarkAsDone } from './put-keying-data-mark-as-done.controller';

console.error = jest.fn();

jest.mock('../../api');

describe('put-keying-data-mark-as-done.controller', () => {
  describe('putKeyingDataMarkAsDone', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    const reportId = '12';
    const feeRecordIds = [1, 2];
    const user = aTfmSessionUser();

    const getHttpMocks = () =>
      httpMocks.createMocks({
        params: { reportId },
        body: {
          user,
          feeRecordIds,
        },
      });

    it('marks keying data as DONE and responds with a 200', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await putKeyingDataMarkAsDone(req, res);

      // Assert
      expect(api.markKeyingDataAsDone).toHaveBeenCalledWith(reportId, feeRecordIds, user);
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(res._isEndCalled()).toBe(true);
    });

    it('responds with a 500 if an unknown error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.markKeyingDataAsDone).mockRejectedValue(new Error('Some error'));

      // Act
      await putKeyingDataMarkAsDone(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toBe(true);
    });

    it('responds with a specific error code if an axios error is thrown', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

      jest.mocked(api.markKeyingDataAsDone).mockRejectedValue(axiosError);

      // Act
      await putKeyingDataMarkAsDone(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(errorStatus);
      expect(res._isEndCalled()).toBe(true);
    });

    it('responds with an error message', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.markKeyingDataAsDone).mockRejectedValue(new Error('Some error'));

      // Act
      await putKeyingDataMarkAsDone(req, res);

      // Assert
      expect(res._getData()).toBe('Failed to mark keying data as done');
      expect(res._isEndCalled()).toBe(true);
    });
  });
});
