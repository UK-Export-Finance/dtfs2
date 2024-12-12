import { HttpStatusCode } from 'axios';
import { API_ERROR_CODE } from '../../constants';
import { ErrorResponse } from './types';
import { extractPathParameterPlaceholders } from './extract-path-parameter-placeholders';

type WithSqlIdPathParameterValidationTestsParams = {
  baseUrl: string;
  makeRequest: (url: string) => Promise<ErrorResponse>;
};

const VALID_SQL_ID = '123';

/**
 * Test helper to test the sql id validation middleware being used for a specific route
 * @param params - The test parameters
 * @param params.baseUrl - The base url with format '/v1/path/:pathParamater'
 * and with all non-sql id path parameters replaced with values
 * @param params.makeRequest - The function to make the request with
 */
export const withSqlIdPathParameterValidationTests = ({ baseUrl, makeRequest }: WithSqlIdPathParameterValidationTestsParams): void => {
  const parameters = extractPathParameterPlaceholders(baseUrl);

  describe.each(parameters)("when the ':%s' path parameter is not a valid sql id", (parameter) => {
    const baseUrlWithTestParameter = baseUrl.replace(`:${parameter}`, 'invalid-id');

    const testUrl = parameters.reduce((url, validParameter) => url.replace(`:${validParameter}`, VALID_SQL_ID), baseUrlWithTestParameter);

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
