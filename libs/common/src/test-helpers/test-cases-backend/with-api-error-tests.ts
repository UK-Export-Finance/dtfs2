import { HttpStatusCode } from 'axios';
import { MockResponse } from 'node-mocks-http';
import { Response } from 'express';
import { API_ERROR_CODE } from '../../constants';
import { TestApiError } from '../test-api-error';

export const withApiErrorTests = ({
  mockAnError,
  makeRequest,
  getRes,
  endpointErrorMessage,
}: {
  mockAnError: (error: unknown) => void;
  makeRequest: () => Promise<unknown>;
  getRes: () => MockResponse<Response>;
  endpointErrorMessage: string;
}) => {
  describe('with api error tests', () => {
    describe('when an api error is thrown', () => {
      it('should transform and return the error', async () => {
        // Arrange
        const errorStatus = HttpStatusCode.BadRequest;
        const errorMessage = 'a message that should not be exposed';
        const errorCode = API_ERROR_CODE.INVALID_PAYLOAD;

        const error = new TestApiError({ status: errorStatus, message: errorMessage, code: errorCode });
        mockAnError(error);

        // Act
        await makeRequest();

        // Assert
        const res = getRes();
        expect(res._getStatusCode()).toEqual(errorStatus);
        expect(res._getData()).toEqual({
          status: errorStatus,
          message: `${endpointErrorMessage}: ${errorMessage}`,
          code: errorCode,
        });
      });
    });

    describe('when a non-api error is thrown', () => {
      it('should return 500 with a generic error message', async () => {
        // Arrange
        const errorMessage = 'a message that should not be exposed';

        const error = new Error(errorMessage);
        mockAnError(error);

        // Act
        await makeRequest();

        // Assert
        const res = getRes();
        expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
        expect(res._getData()).toEqual({
          status: HttpStatusCode.InternalServerError,
          message: endpointErrorMessage,
        });
      });
    });
  });
};
