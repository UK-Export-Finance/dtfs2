import { HttpStatusCode } from 'axios';
import { API_ERROR_CODE } from '../../constants';
import { ErrorResponse } from './types';

type WithSqlIdPathParameterValidationTestsParams = {
  baseUrl: string;
  makeRequest: (url: string) => Promise<ErrorResponse>;
  pathParameters?: string[];
};

const VALID_SQL_ID = '123';

const extractParameters = (url: string): string[] =>
  url
    .split('/')
    .filter((pathStr) => pathStr.startsWith(':'))
    .map((pathParam) => pathParam.replace(':', ''));

/**
 * Test helper to test the sql id validation middleware being used for a specific route
 * @param params - The test parameters
 * @param params.baseUrl - The base url with format '/v1/path/:pathParamater'
 * @param params.makeRequest - The function to make the request with
 * @param params.pathParameters - The path parameters to test
 */
export const withSqlIdPathParameterValidationTests = ({ baseUrl, makeRequest, pathParameters }: WithSqlIdPathParameterValidationTestsParams): void => {
  const parameters = pathParameters ?? extractParameters(baseUrl);

  describe.each(parameters)("when the ':%s' path parameter is not a valid sql id", (parameter) => {
    const baseUrlWithTestParamater = baseUrl.replace(`:${parameter}`, 'invalid-id');

    const testUrl = parameters.reduce((url, validParameter) => url.replace(`:${validParameter}`, VALID_SQL_ID), baseUrlWithTestParamater);

    it('returns a 400 (Bad request)', async () => {
      // Act
      const { status } = await makeRequest(testUrl);

      // Assert
      expect(status).toEqual(HttpStatusCode.BadRequest);
    });

    it(`sets the response body 'code' field to ${API_ERROR_CODE.INVALID_SQL_ID_PATH_PARAMETER}`, async () => {
      // Act
      const { body } = await makeRequest(testUrl);

      // Assert
      expect(body.code).toEqual(API_ERROR_CODE.INVALID_SQL_ID_PATH_PARAMETER);
    });
  });
};
