import { ZodSchema } from 'zod';
import { EntraIdUser } from '../../types/tfm/entra-id-user';
import { ENTRA_ID_USER_GROUP } from '../../constants';
import { withSchemaTests } from './with-schema.tests';

type TestCasesParams = {
  getTestObjectWithUpdatedUserParams: (entraIdUser: unknown) => unknown;
};

type withEntraIdUserSchemaTestsParams = {
  schema: ZodSchema;
} & TestCasesParams;

export function aValidEntraIdUser(): EntraIdUser {
  return {
    oid: 'an-oid',
    verified_primary_email: ['a-primary-email'],
    verified_secondary_email: ['a-secondary-email'],
    given_name: 'a-given-name',
    family_name: 'a-family-name',
    groups: [ENTRA_ID_USER_GROUP.AZURE_SSO_GROUP_BUSINESS_SUPPORT],
  };
}

export function withEntraIdUserSchemaTests({ schema, getTestObjectWithUpdatedUserParams }: withEntraIdUserSchemaTestsParams) {
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { oid, ...rest } = aValidEntraIdUser();
        return getTestObjectWithUpdatedUserParams(rest);
      },
      description: 'the oid is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { verified_primary_email, ...rest } = aValidEntraIdUser();
        return getTestObjectWithUpdatedUserParams(rest);
      },
      description: 'the verified primary email is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { verified_secondary_email, ...rest } = aValidEntraIdUser();
        return getTestObjectWithUpdatedUserParams(rest);
      },
      description: 'the verified secondary email is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { given_name, ...rest } = aValidEntraIdUser();
        return getTestObjectWithUpdatedUserParams(rest);
      },
      description: 'the given name is missing',
    },

    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { family_name, ...rest } = aValidEntraIdUser();
        return getTestObjectWithUpdatedUserParams(rest);
      },
      description: 'the family name is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { groups, ...rest } = aValidEntraIdUser();
        return getTestObjectWithUpdatedUserParams(rest);
      },
      description: 'the groups are missing',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aValidEntraIdUser(), oid: 1 }),
      description: 'the oid is not a string',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aValidEntraIdUser(), verified_primary_email: [1] }),
      description: 'the verify primary email is not a string array',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aValidEntraIdUser(), verified_primary_email: '1' }),
      description: 'the verify primary email is not an array',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aValidEntraIdUser(), verified_secondary_email: [1] }),
      description: 'the verify secondary email is not a string array',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aValidEntraIdUser(), verified_secondary_email: '1' }),
      description: 'the verify secondary email is not an array',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aValidEntraIdUser(), given_name: 1 }),
      description: 'the given name is not a string',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aValidEntraIdUser(), family_name: 1 }),
      description: 'the family name is not a string',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aValidEntraIdUser(), groups: ['NOT_A_USER_GROUP'] }),
      description: 'the groups are not an array of user groups',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aValidEntraIdUser(), groups: ENTRA_ID_USER_GROUP.AZURE_SSO_GROUP_BUSINESS_SUPPORT }),
      description: 'the groups are not an array',
    },
    {
      aTestCase: () => ({}),
      description: 'the object is empty',
    },
  ];
}

function getSuccessTestCases({ getTestObjectWithUpdatedUserParams }: TestCasesParams) {
  return [
    { aTestCase: () => getTestObjectWithUpdatedUserParams(aValidEntraIdUser()), description: 'a complete valid payload is present' },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aValidEntraIdUser(), verified_primary_email: [] }),
      description: 'the verified primary email array is empty',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aValidEntraIdUser(), verified_secondary_email: [] }),
      description: 'the verified secondary email array is empty',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aValidEntraIdUser(), groups: [] }),
      description: 'the groups array is empty',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedUserParams({ ...aValidEntraIdUser(), extraField: 'extra' }),
      description: 'there is an extra field',
    },
  ];
}
