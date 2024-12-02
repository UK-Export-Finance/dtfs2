import { HttpStatusCode } from 'axios';
import { API_ERROR_CODE } from '../../constants';
import { ErrorResponse } from './types';

type WithSqlIdPathParameterValidationTestsParams = {
  baseUrl: string;
  makeRequest: (url: string) => Promise<ErrorResponse>;
  pathParameters?: string[];
};

const VALID_SQL_ID = '123';
const VALID_MONGO_OBJECT_ID = '5c0a7922c9d89830f4911426';

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
 * @param params.pathParameters - All of the SQL path parameters
 */
export const withSqlIdPathParameterValidationTests = ({ baseUrl, makeRequest, pathParameters }: WithSqlIdPathParameterValidationTestsParams): void => {
  const allParameters = extractParameters(baseUrl);
  const sqlParameters = pathParameters ?? allParameters;

  const mongoParameters = allParameters.filter((parameter) => !pathParameters?.includes(parameter));
  const baseUrlWithoutMongoParameters = mongoParameters.reduce((url, parameter) => url.replace(`:${parameter}`, VALID_MONGO_OBJECT_ID), baseUrl);

  describe.each(sqlParameters)("when the ':%s' path parameter is not a valid sql id", (parameter) => {
    const baseUrlWithTestParamater = baseUrlWithoutMongoParameters.replace(`:${parameter}`, 'invalid-id');

    const testUrl = sqlParameters.reduce((url, validParameter) => url.replace(`:${validParameter}`, VALID_SQL_ID), baseUrlWithTestParamater);

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
