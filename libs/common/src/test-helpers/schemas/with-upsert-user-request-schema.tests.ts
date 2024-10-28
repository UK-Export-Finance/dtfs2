import { ZodSchema } from 'zod';
import { withSchemaTests } from './with-schema.tests';
import { UpsertUserRequest } from '../../types';
import { aValidCreateUserRequest, getCreateUserRequestFailureTestCases, getCreateUserRequestSuccessTestCases } from './with-create-user-request-schema.tests';

type TestCasesParams = {
  getTestObjectWithUpdatedUpsertUserRequestParams: (userUpsertRequest: unknown) => unknown;
};

type WithUpsertUserRequestSchemaTestsParams = {
  schema: ZodSchema;
} & Partial<TestCasesParams>;

export function aValidUpsertUserRequest(): UpsertUserRequest {
  return aValidCreateUserRequest();
}

export function withUpsertUserRequestSchemaTests({
  schema,
  getTestObjectWithUpdatedUpsertUserRequestParams = (userUpsertRequest) => userUpsertRequest,
}: WithUpsertUserRequestSchemaTestsParams) {
  describe('with CREATE_USER_REQUEST_SCHEMA tests', () => {
    withSchemaTests({
      schema,
      failureTestCases: getUpsertUserRequestFailureTestCases({ getTestObjectWithUpdatedUpsertUserRequestParams }),
      successTestCases: getUpsertUserRequestSuccessTestCases({ getTestObjectWithUpdatedUpsertUserRequestParams }),
    });
  });
}

export function getUpsertUserRequestFailureTestCases({ getTestObjectWithUpdatedUpsertUserRequestParams }: TestCasesParams) {
  return getCreateUserRequestFailureTestCases({ getTestObjectWithUpdatedCreateUserRequestParams: getTestObjectWithUpdatedUpsertUserRequestParams });
}

export function getUpsertUserRequestSuccessTestCases({ getTestObjectWithUpdatedUpsertUserRequestParams }: TestCasesParams) {
  return getCreateUserRequestSuccessTestCases({ getTestObjectWithUpdatedCreateUserRequestParams: getTestObjectWithUpdatedUpsertUserRequestParams });
}
