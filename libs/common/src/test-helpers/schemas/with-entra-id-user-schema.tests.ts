import { ZodSchema } from 'zod';
import { withSchemaTests } from './with-schema.tests';
import { TEAMS } from '../../constants';
import { aEntraIdUser } from '../mock-data';

/**
 * This is a reusable test to allow for complete testing of schemas that
 * utilise the ENTRA_ID_USER_SCHEMA as part of their definition
 */

type TestCasesParams = {
  getTestObjectWithUpdatedUserParams: (entraIdUser: unknown) => unknown;
};

type WithEntraIdUserSchemaTestsParams = {
  schema: ZodSchema;
} & Partial<TestCasesParams>;

export function withEntraIdUserSchemaTests({ schema, getTestObjectWithUpdatedUserParams = (entraIdUser) => entraIdUser }: WithEntraIdUserSchemaTestsParams) {
  describe('with ENTRA_ID_USER_SCHEMA tests', () => {
    withSchemaTests({
      schema,
      failureTestCases: getFailureTestCases({ getTestObjectWithUpdatedUserParams }),
      successTestCases: getSuccessTestCases({ getTestObjectWithUpdatedUserParams }),
    });
  });
}

function getFailureTestCases({ getTestObjectWithUpdatedUserParams }: TestCasesParams) {
  return [
    {
      aTestCase: () => {
        const { oid: _oid, ...rest } = aEntraIdUser();
        return getTestObjectWithUpdatedUserParams(rest);
      },
      description: 'the oid is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line camelcase
        const { verified_primary_email: _verified_primary_email, ...rest } = aEntraIdUser();
        return getTestObjectWithUpdatedUserParams(rest);
      },
      description: 'the verified primary email is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line camelcase
        const { verified_secondary_email: _verified_secondary_email, ...rest } = aEntraIdUser();
        return getTestObjectWithUpdatedUserParams(rest);
      },
      description: 'the verified secondary email is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line camelcase
        const { given_name: _given_name, ...rest } = aEntraIdUser();
        return getTestObjectWithUpdatedUserParams(rest);
      },
      description: 'the given name is missing',
    },

    {
      aTestCase: () => {
        // eslint-disable-next-line camelcase
        const { family_name: _family_name, ...rest } = aEntraIdUser();
        return getTestObjectWithUpdatedUserParams(rest);
      },
      description: 'the family name is missing',
    },
    {
      aTestCase: () => {
        const { roles: _roles, ...rest } = aEntraIdUser();
        return getTestObjectWithUpdatedUserParams(rest);
      },
      description: 'the roles are missing',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aEntraIdUser(), oid: 1 }),
      description: 'the oid is not a string',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aEntraIdUser(), verified_primary_email: [] }),
      description: 'the verify primary email array is empty',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aEntraIdUser(), verified_primary_email: [1] }),
      description: 'the verify primary email is not a string array',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aEntraIdUser(), verified_primary_email: '1' }),
      description: 'the verify primary email is not an array',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aEntraIdUser(), verified_secondary_email: [1] }),
      description: 'the verify secondary email is not a string array',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aEntraIdUser(), verified_secondary_email: '1' }),
      description: 'the verify secondary email is not an array',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aEntraIdUser(), given_name: 1 }),
      description: 'the given name is not a string',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aEntraIdUser(), family_name: 1 }),
      description: 'the family name is not a string',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aEntraIdUser(), roles: ['NOT_A_USER_ROLE'] }),
      description: 'the roles are not an array of user roles',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aEntraIdUser(), roles: TEAMS.BUSINESS_SUPPORT.id }),
      description: 'the roles are not an array',
    },
    {
      aTestCase: () => ({}),
      description: 'the object is empty',
    },
  ];
}

function getSuccessTestCases({ getTestObjectWithUpdatedUserParams }: TestCasesParams) {
  return [
    { aTestCase: () => getTestObjectWithUpdatedUserParams(aEntraIdUser()), description: 'a complete valid payload is present' },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aEntraIdUser(), verified_secondary_email: [] }),
      description: 'the verified secondary email array is empty',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aEntraIdUser(), roles: [] }),
      description: 'the roles array is empty',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aEntraIdUser(), extraField: 'extra' }),
      description: 'there is an extra field',
    },
  ];
}
