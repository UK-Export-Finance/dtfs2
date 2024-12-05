import { HttpStatusCode } from 'axios';
import { API_ERROR_CODE } from '../../constants';
import { ErrorResponse } from './types';

type WithMongoIdPathParameterValidationTestsParams = {
  baseUrl: string;
  makeRequest: (url: string) => Promise<ErrorResponse>;
};

const VALID_OBJECT_ID = '5c0a7922c9d89830f4911426';

const extractParameters = (url: string): string[] =>
  url
    .split('/')
    .filter((pathStr) => pathStr.startsWith(':'))
    .map((pathParam) => pathParam.replace(':', ''));

/**
 * Test helper to test the mongo id validation middleware being used for a specific route
 * @param params - The test parameters
 * @param params.baseUrl - The base url with format '/v1/path/:pathParamater'
 * and with all non-mongo id path parameters replaced with values
 * @param params.makeRequest - The function to make the request with
 */
export const withMongoIdPathParameterValidationTests = ({ baseUrl, makeRequest }: WithMongoIdPathParameterValidationTestsParams): void => {
  const parameters = extractParameters(baseUrl);

  describe.each(parameters)("when the ':%s' path parameter is not a valid mongo id", (parameter) => {
    const baseUrlWithTestParameter = baseUrl.replace(`:${parameter}`, 'invalid-id');

    const testUrl = parameters.reduce((url, validParameter) => url.replace(`:${validParameter}`, VALID_OBJECT_ID), baseUrlWithTestParameter);

    it('returns a 400 (Bad request)', async () => {
      // Act
      const { status } = await makeRequest(testUrl);

      // Assert
      expect(status).toEqual(HttpStatusCode.BadRequest);
    });

    it(`sets the response body 'code' field to ${API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER}`, async () => {
      // Act
      const { body } = await makeRequest(testUrl);

      // Assert
      expect(body.code).toEqual(API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER);
    });
  });
};
