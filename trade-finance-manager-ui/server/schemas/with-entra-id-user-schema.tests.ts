import { ZodObject } from 'zod';
import { withSchemaTests } from '../../test-helpers';
import { EntraIdUser } from '../types/entra-id-user';
import { ENTRA_ID_USER_GROUP } from '../constants/entra-id-user';

type TestCasesParams = {
  getValidObjectWithUpdatedEntraIdUserParams: (entraIdUser: unknown) => unknown;
};

type withEntraIdUserSchemaTestsParams = {
  schema: ZodObject<any>;
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

export function withEntraIdUserSchemaTests({ schema, getValidObjectWithUpdatedEntraIdUserParams }: withEntraIdUserSchemaTestsParams) {
  describe('with EntraIdUserSchema tests', () => {
    withSchemaTests({
      schema,
      failureTestCases: getFailureTestCases({ getValidObjectWithUpdatedEntraIdUserParams }),
      successTestCases: getSuccessTestCases({ getValidObjectWithUpdatedEntraIdUserParams }),
    });
  });
}

function getFailureTestCases({ getValidObjectWithUpdatedEntraIdUserParams }: TestCasesParams) {
  return [
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { oid, ...rest } = aValidEntraIdUser();
        return getValidObjectWithUpdatedEntraIdUserParams(rest);
      },
      description: 'the oid is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { verified_primary_email, ...rest } = aValidEntraIdUser();
        return getValidObjectWithUpdatedEntraIdUserParams(rest);
      },
      description: 'the verified primary email is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { verified_secondary_email, ...rest } = aValidEntraIdUser();
        return getValidObjectWithUpdatedEntraIdUserParams(rest);
      },
      description: 'the verified secondary email is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { given_name, ...rest } = aValidEntraIdUser();
        return getValidObjectWithUpdatedEntraIdUserParams(rest);
      },
      description: 'the given name is missing',
    },

    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { family_name, ...rest } = aValidEntraIdUser();
        return getValidObjectWithUpdatedEntraIdUserParams(rest);
      },
      description: 'the family name is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { groups, ...rest } = aValidEntraIdUser();
        return getValidObjectWithUpdatedEntraIdUserParams(rest);
      },
      description: 'the groups are missing',
    },
    {
      aTestCase: () => getValidObjectWithUpdatedEntraIdUserParams({ ...aValidEntraIdUser(), oid: 1 }),
      description: 'the oid is not a string',
    },
    {
      aTestCase: () => getValidObjectWithUpdatedEntraIdUserParams({ ...aValidEntraIdUser(), verified_primary_email: [1] }),
      description: 'the verify primary email is not a string array',
    },
    {
      aTestCase: () => getValidObjectWithUpdatedEntraIdUserParams({ ...aValidEntraIdUser(), verified_primary_email: '1' }),
      description: 'the verify primary email is not an array',
    },
    {
      aTestCase: () => getValidObjectWithUpdatedEntraIdUserParams({ ...aValidEntraIdUser(), verified_secondary_email: [1] }),
      description: 'the verify secondary email is not a string array',
    },
    {
      aTestCase: () => getValidObjectWithUpdatedEntraIdUserParams({ ...aValidEntraIdUser(), verified_secondary_email: '1' }),
      description: 'the verify secondary email is not an array',
    },
    {
      aTestCase: () => getValidObjectWithUpdatedEntraIdUserParams({ ...aValidEntraIdUser(), given_name: 1 }),
      description: 'the given name is not a string',
    },
    {
      aTestCase: () => getValidObjectWithUpdatedEntraIdUserParams({ ...aValidEntraIdUser(), family_name: 1 }),
      description: 'the family name is not a string',
    },
    {
      aTestCase: () => getValidObjectWithUpdatedEntraIdUserParams({ ...aValidEntraIdUser(), groups: ['NOT_A_USER_GROUP'] }),
      description: 'the groups are not an array of user groups',
    },
    {
      aTestCase: () => getValidObjectWithUpdatedEntraIdUserParams({ ...aValidEntraIdUser(), groups: ENTRA_ID_USER_GROUP.AZURE_SSO_GROUP_BUSINESS_SUPPORT }),
      description: 'the groups are not an array',
    },
    {
      aTestCase: () => ({}),
      description: 'the object is empty',
    },
  ];
}

function getSuccessTestCases({ getValidObjectWithUpdatedEntraIdUserParams }: TestCasesParams) {
  return [
    { aTestCase: () => getValidObjectWithUpdatedEntraIdUserParams(aValidEntraIdUser()), description: 'a complete valid payload is present' },
    {
      aTestCase: () => getValidObjectWithUpdatedEntraIdUserParams({ ...aValidEntraIdUser(), verified_primary_email: [] }),
      description: 'the verified primary email array is empty',
    },
    {
      aTestCase: () => getValidObjectWithUpdatedEntraIdUserParams({ ...aValidEntraIdUser(), verified_secondary_email: [] }),
      description: 'the verified secondary email array is empty',
    },
    {
      aTestCase: () => getValidObjectWithUpdatedEntraIdUserParams({ ...aValidEntraIdUser(), groups: [] }),
      description: 'the groups array is empty',
    },
    {
      aTestCase: () => getValidObjectWithUpdatedEntraIdUserParams({ ...aValidEntraIdUser(), extraField: 'extra' }),
      description: 'there is an extra field',
    },
  ];
}
