import { EntraIdAuthenticationResult } from '../types/entra-id';
import { withSchemaTests } from '../../test-helpers';
import { EntraIdAuthenticationResultSchema } from './entra-id.schema';
import { aValidEntraIdUser, withEntraIdUserSchemaTests } from './with-entra-id-user-schema.tests';

describe('EntraIdAuthenticationResultSchema', () => {
  withEntraIdUserSchemaTests({
    schema: EntraIdAuthenticationResultSchema,
    getValidObjectWithUpdatedEntraIdUserParams: (entraIdUser) => ({
      ...aValidPayload(),
      account: { idTokenClaims: entraIdUser },
    }),
  });

  withSchemaTests({
    schema: EntraIdAuthenticationResultSchema,
    failureTestCases: getFailureTestCases(),
    successTestCases: getSuccessTestCases(),
  });
});

function aValidPayload(): EntraIdAuthenticationResult {
  return {
    accessToken: 'an-access-token',
    account: { idTokenClaims: aValidEntraIdUser() },
  };
}

function getFailureTestCases() {
  return [
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { accessToken, ...rest } = aValidPayload();
        return rest;
      },
      description: 'the access token is missing',
    },
    {
      aTestCase: () => ({ ...aValidPayload(), accessToken: 1 }),
      description: 'the access token is not a string',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { accessToken } = aValidPayload();
        return { accessToken, account: {} };
      },
      description: 'the account does not have an id token claims',
    },
    {
      aTestCase: () => ({}),
      description: 'the object is empty',
    },
  ];
}

function getSuccessTestCases() {
  return [
    { aTestCase: aValidPayload, description: 'a complete valid payload is present' },
    {
      aTestCase: () => ({ ...aValidPayload(), extraField: 'extra' }),
      description: 'there is an extra field',
    },
  ];
}
