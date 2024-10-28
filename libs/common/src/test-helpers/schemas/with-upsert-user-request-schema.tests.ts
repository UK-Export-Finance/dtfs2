import { ZodSchema } from 'zod';
import { withSchemaTests } from './with-schema.tests';
import { UpsertUserRequest } from '../../types';
import { aValidCreateUserRequest, getCreateUserRequestFailureTestCases, getCreateUserRequestSuccessTestCases } from './with-create-user-request-schema.tests';

/**
 * This is a reusable test to allow for complete testing of schemas that
 * utilise the UPSERT_USER_REQUEST_SCHEMA as part of their definition
 *
 * Note: UPSERT_USER_REQUEST_SCHEMA is effectively an alias for CREATE_USER_REQUEST_SCHEMA
 */

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
  describe('with UPSERT_USER_REQUEST_SCHEMA tests', () => {
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
