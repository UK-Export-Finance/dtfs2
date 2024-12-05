import { ErrorResponse } from './types';
import { withSqlIdPathParameterValidationTests } from './with-sql-id-path-parameter-validation-tests';
import { withMongoIdPathParameterValidationTests } from './with-mongo-id-path-parameter-validation-tests';

type WithSqlAndMongoIdPathParameterValidationTestsParams = {
  baseUrl: string;
  makeRequest: (url: string) => Promise<ErrorResponse>;
  sqlPathParameters: string[];
  mongoPathParameters: string[];
};

const VALID_SQL_ID = '123';
const VALID_MONGO_OBJECT_ID = '5c0a7922c9d89830f4911426';

/**
 * Test helper to test the sql and mongo id validation middleware being used for a specific route
 * @param params - The test parameters
 * @param params.baseUrl - The base url with format '/v1/path/:pathParamater'
 * @param params.makeRequest - The function to make the request with
 * @param params.sqlPathParameters - The sql id path parameters
 * @param params.mongoPathParameters - The mongo id path parameters
 */
export const withSqlAndMongoIdPathParameterValidationTests = ({
  baseUrl,
  makeRequest,
  sqlPathParameters,
  mongoPathParameters,
}: WithSqlAndMongoIdPathParameterValidationTestsParams): void => {
  const baseUrlWithoutMongoParameters = mongoPathParameters.reduce((url, parameter) => url.replace(`:${parameter}`, VALID_MONGO_OBJECT_ID), baseUrl);
  withSqlIdPathParameterValidationTests({ baseUrl: baseUrlWithoutMongoParameters, makeRequest });

  const baseUrlWithoutSqlParameters = sqlPathParameters.reduce((url, parameter) => url.replace(`:${parameter}`, VALID_SQL_ID), baseUrl);
  withMongoIdPathParameterValidationTests({ baseUrl: baseUrlWithoutSqlParameters, makeRequest });
};
