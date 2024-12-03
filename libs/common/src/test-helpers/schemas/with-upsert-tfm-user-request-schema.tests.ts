import { ZodSchema } from 'zod';
import { withSchemaTests } from './with-schema.tests';
import { getCreateTfmUserRequestFailureTestCases, getCreateTfmUserRequestSuccessTestCases } from './with-create-tfm-user-request-schema.tests';

/**
 * This is a reusable test to allow for complete testing of schemas that
 * utilise the UPSERT_TFM_USER_REQUEST_SCHEMA as part of their definition
 *
 * Note: UPSERT_TFM_USER_REQUEST_SCHEMA is effectively an alias for CREATE_TFM_USER_REQUEST_SCHEMA
 */

type TestCasesParams = {
  getTestObjectWithUpdatedUpsertTfmUserRequestParams: (upsertTfmUserRequest: unknown) => unknown;
};

type WithUpsertTfmUserRequestSchemaTestsParams = {
  schema: ZodSchema;
} & Partial<TestCasesParams>;

export function withUpsertTfmUserRequestSchemaTests({
  schema,
  getTestObjectWithUpdatedUpsertTfmUserRequestParams = (upsertTfmUserRequest) => upsertTfmUserRequest,
}: WithUpsertTfmUserRequestSchemaTestsParams) {
  describe('with UPSERT_TFM_USER_REQUEST_SCHEMA tests', () => {
    withSchemaTests({
      schema,
      failureTestCases: getUpsertTfmUserRequestFailureTestCases({ getTestObjectWithUpdatedUpsertTfmUserRequestParams }),
      successTestCases: getUpsertTfmUserRequestSuccessTestCases({ getTestObjectWithUpdatedUpsertTfmUserRequestParams }),
    });
  });
}

export function getUpsertTfmUserRequestFailureTestCases({
  getTestObjectWithUpdatedUpsertTfmUserRequestParams = (upsertTfmUserRequest) => upsertTfmUserRequest,
}: TestCasesParams) {
  return getCreateTfmUserRequestFailureTestCases({ getTestObjectWithUpdatedCreateTfmUserRequestParams: getTestObjectWithUpdatedUpsertTfmUserRequestParams });
}

export function getUpsertTfmUserRequestSuccessTestCases({
  getTestObjectWithUpdatedUpsertTfmUserRequestParams = (upsertTfmUserRequest) => upsertTfmUserRequest,
}: TestCasesParams) {
  return getCreateTfmUserRequestSuccessTestCases({ getTestObjectWithUpdatedCreateTfmUserRequestParams: getTestObjectWithUpdatedUpsertTfmUserRequestParams });
}
