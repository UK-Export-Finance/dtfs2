import { HttpStatusCode } from 'axios';
import { MockResponse } from 'node-mocks-http';
import { Response } from 'express';
import { API_ERROR_CODE } from '../../constants';
import { TestApiError } from '../test-api-error';

/**
 * Parameters for the withApiErrorTests function
 *
 * We use a getter for the response object to ensure the correct instance is used.
 * It also allows for res to not be initiated until the test is run,
 * which is a common pattern when writing our tests
 *
 * @param mockAnError - a function that will mock an error being thrown
 * @param makeRequest - a function that will make the request to the endpoint
 * @param getRes - a function that will return the response object
 * @param endpointErrorMessage - the error message that should be returned from the endpoint (either with an api message when throwing an api error, or by itself otherwise)
 */
type WithApiErrorTestsParams = {
  mockAnError: (error: unknown) => void;
  makeRequest: () => Promise<unknown>;
  getRes: () => MockResponse<Response>;
  endpointErrorMessage: string;
};

/**
 * Generates tests for testing errors thrown from a backend endpoint, including
 * testing the responses for the api error class, and generic error classes
 */
export const withApiErrorTests = ({ mockAnError, makeRequest, getRes, endpointErrorMessage }: WithApiErrorTestsParams) => {
  describe('with api error tests', () => {
    describe('when an api error is thrown', () => {
      it('should return the errors status code with error details', async () => {
        // Arrange
        const errorStatus = HttpStatusCode.BadRequest;
        const errorMessage = 'a message that should be exposed';
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
      it('should return a 500 with a generic error message', async () => {
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
