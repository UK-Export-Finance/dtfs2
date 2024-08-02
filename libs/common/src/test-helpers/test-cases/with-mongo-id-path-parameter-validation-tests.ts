import { HttpStatusCode } from 'axios';
import { Response } from 'supertest';
import { ApiErrorResponseBody } from '../../types';
import { API_ERROR_CODE } from '../../constants';

interface ErrorResponse extends Response {
  body: ApiErrorResponseBody;
}

type WithMongoIdPathParameterValidationTestsParams = {
  baseUrl: string;
  makeRequest: <TResponse extends ErrorResponse>(url: string) => Promise<TResponse>;
};

const VALID_OBJECT_ID = '5c0a7922c9d89830f4911426';

const extractParameters = (url: string): string[] =>
  url
    .split('/')
    .filter((pathStr) => pathStr.startsWith(':'))
    .map((pathParam) => pathParam.replace(':', ''));

export const withMongoIdPathParameterValidationTests = ({ baseUrl, makeRequest }: WithMongoIdPathParameterValidationTestsParams): void => {
  const parameters = extractParameters(baseUrl);

  describe.each(parameters)("when the ':%s' path parameter is not a valid mongo id", (parameter) => {
    const baseUrlWithTestParamater = baseUrl.replace(`:${parameter}`, 'invalid-id');

    const testUrl = parameters.reduce((url, validParameter) => url.replace(`:${validParameter}`, VALID_OBJECT_ID), baseUrlWithTestParamater);

    it('returns a 400 (Bad request)', async () => {
      // Act
      const { status } = await makeRequest(testUrl);

      // Assert
      expect(status).toBe(HttpStatusCode.BadRequest);
    });

    it(`sets the response body 'code' field to ${API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER}`, async () => {
      // Act
      const { body } = await makeRequest(testUrl);

      // Assert
      expect(body.code).toBe(API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER);
    });
  });
};
