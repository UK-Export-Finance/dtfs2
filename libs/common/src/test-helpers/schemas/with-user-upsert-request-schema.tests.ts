import { ZodSchema } from 'zod';
import { withSchemaTests } from './with-schema.tests';
import { UserUpsertRequest } from '../../types';

type TestCasesParams = {
  getTestObjectWithUpdatedUserUpsertRequestParams: (userUpsertRequest: unknown) => unknown;
};

type WithUserUpsertRequestSchemaTestsParams = {
  schema: ZodSchema;
} & TestCasesParams;

export function aValidUserUpsertRequest(): UserUpsertRequest {
  return {
    azureOid: 'an-azure-oid',
    email: 'an-email',
    username: 'a-username',
    teams: ['BUSINESS_SUPPORT'],
    timezone: 'Europe/London',
    firstName: 'a-first-name',
    lastName: 'a-last-name',
  };
}

export function withUserUpsertRequestSchemaTests({ schema, getTestObjectWithUpdatedUserUpsertRequestParams }: WithUserUpsertRequestSchemaTestsParams) {
  describe('with USER_UPSERT_REQUEST_SCHEMA tests', () => {
    withSchemaTests({
      schema,
      failureTestCases: getUserUpsertRequestFailureTestCases({ getTestObjectWithUpdatedUserUpsertRequestParams }),
      successTestCases: getUserUpsertRequestSuccessTestCases({ getTestObjectWithUpdatedUserUpsertRequestParams }),
    });
  });
}

export function getUserUpsertRequestFailureTestCases({ getTestObjectWithUpdatedUserUpsertRequestParams }: TestCasesParams) {
  return [
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { azureOid, ...rest } = aValidUserUpsertRequest();
        return getTestObjectWithUpdatedUserUpsertRequestParams(rest);
      },
      description: 'the azureOid is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { email, ...rest } = aValidUserUpsertRequest();
        return getTestObjectWithUpdatedUserUpsertRequestParams(rest);
      },
      description: 'the email is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { username, ...rest } = aValidUserUpsertRequest();
        return getTestObjectWithUpdatedUserUpsertRequestParams(rest);
      },
      description: 'the username is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { teams, ...rest } = aValidUserUpsertRequest();
        return getTestObjectWithUpdatedUserUpsertRequestParams(rest);
      },
      description: 'the teams is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { timezone, ...rest } = aValidUserUpsertRequest();
        return getTestObjectWithUpdatedUserUpsertRequestParams(rest);
      },
      description: 'the timezone is missing',
    },

    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { firstName, ...rest } = aValidUserUpsertRequest();
        return getTestObjectWithUpdatedUserUpsertRequestParams(rest);
      },
      description: 'the first name is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { lastName, ...rest } = aValidUserUpsertRequest();
        return getTestObjectWithUpdatedUserUpsertRequestParams(rest);
      },
      description: 'the last name is missing',
    },
    {
      aTestCase: () => ({ ...aValidUserUpsertRequest(), azureOid: 1 }),
      description: 'the azureOid is not a string',
    },
    {
      aTestCase: () => ({ ...aValidUserUpsertRequest(), email: 1 }),
      description: 'the email is not a string',
    },
    {
      aTestCase: () => ({ ...aValidUserUpsertRequest(), username: 1 }),
      description: 'the username is not a string',
    },
    {
      aTestCase: () => ({ ...aValidUserUpsertRequest(), teams: [1] }),
      description: 'the teams is not a string array',
    },
    {
      aTestCase: () => ({ ...aValidUserUpsertRequest(), teams: 'BUSINESS_SUPPORT' }),
      description: 'the teams is not an array',
    },
    {
      aTestCase: () => ({ ...aValidUserUpsertRequest(), timezone: 1 }),
      description: 'the timezone is not a string',
    },
    {
      aTestCase: () => ({ ...aValidUserUpsertRequest(), firstName: 1 }),
      description: 'the first name is not a string',
    },
    {
      aTestCase: () => ({ ...aValidUserUpsertRequest(), lastName: 1 }),
      description: 'the last name is not a string',
    },
    {
      aTestCase: () => ({}),
      description: 'the object is empty',
    },
  ];
}

export function getUserUpsertRequestSuccessTestCases({ getTestObjectWithUpdatedUserUpsertRequestParams }: TestCasesParams) {
  return [
    { aTestCase: () => getTestObjectWithUpdatedUserUpsertRequestParams(aValidUserUpsertRequest()), description: 'a complete valid payload is present' },
    {
      aTestCase: () => getTestObjectWithUpdatedUserUpsertRequestParams({ ...aValidUserUpsertRequest(), teams: [] }),
      description: 'the teams array is empty',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserUpsertRequestParams({ ...aValidUserUpsertRequest(), extraField: 'extra' }),
      description: 'there is an extra field',
    },
  ];
}
