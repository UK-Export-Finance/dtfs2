import { ZodSchema } from 'zod';
import { withSchemaTests } from './with-schema.tests';
import { CreateUserRequest } from '../../types';

type TestCasesParams = {
  getTestObjectWithUpdatedCreateUserRequestParams: (userUpsertRequest: unknown) => unknown;
};

type WithCreateUserRequestSchemaTestsParams = {
  schema: ZodSchema;
} & Partial<TestCasesParams>;

export function aValidCreateUserRequest(): CreateUserRequest {
  return {
    azureOid: 'an-azure-oid',
    email: 'an-email',
    username: 'a-username',
    teams: ['BUSINESS_SUPPORT'],
    timezone: 'Europe/London',
    firstName: 'a-first-name',
    lastName: 'a-last-name',
    lastLogin: Date.now(),
  };
}

export function withCreateUserRequestSchemaTests({
  schema,
  getTestObjectWithUpdatedCreateUserRequestParams = (userUpsertRequest) => userUpsertRequest,
}: WithCreateUserRequestSchemaTestsParams) {
  describe('with CREATE_USER_REQUEST_SCHEMA tests', () => {
    withSchemaTests({
      schema,
      failureTestCases: getCreateUserRequestFailureTestCases({ getTestObjectWithUpdatedCreateUserRequestParams }),
      successTestCases: getCreateUserRequestSuccessTestCases({ getTestObjectWithUpdatedCreateUserRequestParams }),
    });
  });
}

export function getCreateUserRequestFailureTestCases({ getTestObjectWithUpdatedCreateUserRequestParams }: TestCasesParams) {
  return [
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { azureOid, ...rest } = aValidCreateUserRequest();
        return getTestObjectWithUpdatedCreateUserRequestParams(rest);
      },
      description: 'the azureOid is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { email, ...rest } = aValidCreateUserRequest();
        return getTestObjectWithUpdatedCreateUserRequestParams(rest);
      },
      description: 'the email is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { username, ...rest } = aValidCreateUserRequest();
        return getTestObjectWithUpdatedCreateUserRequestParams(rest);
      },
      description: 'the username is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { teams, ...rest } = aValidCreateUserRequest();
        return getTestObjectWithUpdatedCreateUserRequestParams(rest);
      },
      description: 'the teams is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { timezone, ...rest } = aValidCreateUserRequest();
        return getTestObjectWithUpdatedCreateUserRequestParams(rest);
      },
      description: 'the timezone is missing',
    },

    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { firstName, ...rest } = aValidCreateUserRequest();
        return getTestObjectWithUpdatedCreateUserRequestParams(rest);
      },
      description: 'the first name is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { lastName, ...rest } = aValidCreateUserRequest();
        return getTestObjectWithUpdatedCreateUserRequestParams(rest);
      },
      description: 'the last name is missing',
    },
    {
      aTestCase: () => ({ ...aValidCreateUserRequest(), azureOid: 1 }),
      description: 'the azureOid is not a string',
    },
    {
      aTestCase: () => ({ ...aValidCreateUserRequest(), email: 1 }),
      description: 'the email is not a string',
    },
    {
      aTestCase: () => ({ ...aValidCreateUserRequest(), username: 1 }),
      description: 'the username is not a string',
    },
    {
      aTestCase: () => ({ ...aValidCreateUserRequest(), teams: [1] }),
      description: 'the teams is not a string array',
    },
    {
      aTestCase: () => ({ ...aValidCreateUserRequest(), teams: 'BUSINESS_SUPPORT' }),
      description: 'the teams is not an array',
    },
    {
      aTestCase: () => ({ ...aValidCreateUserRequest(), timezone: 1 }),
      description: 'the timezone is not a string',
    },
    {
      aTestCase: () => ({ ...aValidCreateUserRequest(), firstName: 1 }),
      description: 'the first name is not a string',
    },
    {
      aTestCase: () => ({ ...aValidCreateUserRequest(), lastName: 1 }),
      description: 'the last name is not a string',
    },
    {
      aTestCase: () => ({}),
      description: 'the object is empty',
    },
  ];
}

export function getCreateUserRequestSuccessTestCases({ getTestObjectWithUpdatedCreateUserRequestParams }: TestCasesParams) {
  return [
    { aTestCase: () => getTestObjectWithUpdatedCreateUserRequestParams(aValidCreateUserRequest()), description: 'a complete valid payload is present' },
    {
      aTestCase: () => getTestObjectWithUpdatedCreateUserRequestParams({ ...aValidCreateUserRequest(), teams: [] }),
      description: 'the teams array is empty',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedCreateUserRequestParams({ ...aValidCreateUserRequest(), extraField: 'extra' }),
      description: 'there is an extra field',
    },
  ];
}
