import { ZodSchema } from 'zod';
import { withSchemaTests } from './with-schema.tests';
import { aCreateTfmUserRequest } from '../mock-data/create-tfm-user-request';

/**
 * This is a reusable test to allow for complete testing of schemas that
 * utilise the CREATE_TFM_USER_REQUEST_SCHEMA as part of their definition
 */

type TestCasesParams = {
  getTestObjectWithUpdatedCreateTfmUserRequestParams: (CreateTfmUserRequest: unknown) => unknown;
};

type WithCreateTfmUserRequestSchemaTestsParams = {
  schema: ZodSchema;
} & Partial<TestCasesParams>;

export function withCreateTfmUserRequestSchemaTests({
  schema,
  getTestObjectWithUpdatedCreateTfmUserRequestParams = (CreateTfmUserRequest) => CreateTfmUserRequest,
}: WithCreateTfmUserRequestSchemaTestsParams) {
  describe('with CREATE_TFM_USER_REQUEST_SCHEMA tests', () => {
    withSchemaTests({
      schema,
      failureTestCases: getCreateTfmUserRequestFailureTestCases({ getTestObjectWithUpdatedCreateTfmUserRequestParams }),
      successTestCases: getCreateTfmUserRequestSuccessTestCases({ getTestObjectWithUpdatedCreateTfmUserRequestParams }),
    });
  });
}

export function getCreateTfmUserRequestFailureTestCases({ getTestObjectWithUpdatedCreateTfmUserRequestParams }: TestCasesParams) {
  return [
    {
      aTestCase: () => {
        const { azureOid: _azureOid, ...rest } = aCreateTfmUserRequest();
        return getTestObjectWithUpdatedCreateTfmUserRequestParams(rest);
      },
      description: 'the azureOid is missing',
    },
    {
      aTestCase: () => {
        const { email: _email, ...rest } = aCreateTfmUserRequest();
        return getTestObjectWithUpdatedCreateTfmUserRequestParams(rest);
      },
      description: 'the email is missing',
    },
    {
      aTestCase: () => {
        const { username: _username, ...rest } = aCreateTfmUserRequest();
        return getTestObjectWithUpdatedCreateTfmUserRequestParams(rest);
      },
      description: 'the username is missing',
    },
    {
      aTestCase: () => {
        const { teams: _teams, ...rest } = aCreateTfmUserRequest();
        return getTestObjectWithUpdatedCreateTfmUserRequestParams(rest);
      },
      description: 'the teams is missing',
    },
    {
      aTestCase: () => {
        const { timezone: _timezone, ...rest } = aCreateTfmUserRequest();
        return getTestObjectWithUpdatedCreateTfmUserRequestParams(rest);
      },
      description: 'the timezone is missing',
    },

    {
      aTestCase: () => {
        const { firstName: _firstName, ...rest } = aCreateTfmUserRequest();
        return getTestObjectWithUpdatedCreateTfmUserRequestParams(rest);
      },
      description: 'the first name is missing',
    },
    {
      aTestCase: () => {
        const { lastName: _lastName, ...rest } = aCreateTfmUserRequest();
        return getTestObjectWithUpdatedCreateTfmUserRequestParams(rest);
      },
      description: 'the last name is missing',
    },
    {
      aTestCase: () => ({ ...aCreateTfmUserRequest(), azureOid: 1 }),
      description: 'the azureOid is not a string',
    },
    {
      aTestCase: () => ({ ...aCreateTfmUserRequest(), email: 1 }),
      description: 'the email is not a string',
    },
    {
      aTestCase: () => ({ ...aCreateTfmUserRequest(), username: 1 }),
      description: 'the username is not a string',
    },
    {
      aTestCase: () => ({ ...aCreateTfmUserRequest(), teams: [1] }),
      description: 'the teams is not a string array',
    },
    {
      aTestCase: () => ({ ...aCreateTfmUserRequest(), teams: 'BUSINESS_SUPPORT' }),
      description: 'the teams is not an array',
    },
    {
      aTestCase: () => ({ ...aCreateTfmUserRequest(), timezone: 1 }),
      description: 'the timezone is not a string',
    },
    {
      aTestCase: () => ({ ...aCreateTfmUserRequest(), firstName: 1 }),
      description: 'the first name is not a string',
    },
    {
      aTestCase: () => ({ ...aCreateTfmUserRequest(), lastName: 1 }),
      description: 'the last name is not a string',
    },
    {
      aTestCase: () => ({}),
      description: 'the object is empty',
    },
  ];
}

export function getCreateTfmUserRequestSuccessTestCases({ getTestObjectWithUpdatedCreateTfmUserRequestParams }: TestCasesParams) {
  return [
    { aTestCase: () => getTestObjectWithUpdatedCreateTfmUserRequestParams(aCreateTfmUserRequest()), description: 'a complete valid payload is present' },
    {
      aTestCase: () => getTestObjectWithUpdatedCreateTfmUserRequestParams({ ...aCreateTfmUserRequest(), teams: [] }),
      description: 'the teams array is empty',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedCreateTfmUserRequestParams({ ...aCreateTfmUserRequest(), extraField: 'extra' }),
      description: 'there is an extra field',
    },
  ];
}
