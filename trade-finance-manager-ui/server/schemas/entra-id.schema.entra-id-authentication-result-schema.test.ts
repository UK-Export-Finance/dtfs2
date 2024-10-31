import { anEntraIdUser, withEntraIdUserSchemaTests, withSchemaTests } from '@ukef/dtfs2-common';
import { EntraIdAuthenticationResult } from '../types/entra-id';
import { ENTRA_ID_AUTHENTICATION_RESULT_SCHEMA } from './entra-id.schema';

describe('ENTRA_ID_AUTHENTICATION_RESULT_SCHEMA', () => {
  withEntraIdUserSchemaTests({
    schema: ENTRA_ID_AUTHENTICATION_RESULT_SCHEMA,
    getTestObjectWithUpdatedUserParams: (entraIdUser) => ({
      ...aValidPayload(),
      account: { idTokenClaims: entraIdUser },
    }),
  });

  withSchemaTests({
    schema: ENTRA_ID_AUTHENTICATION_RESULT_SCHEMA,
    failureTestCases: getFailureTestCases(),
    successTestCases: getSuccessTestCases(),
  });
});

function aValidPayload(): EntraIdAuthenticationResult {
  return {
    accessToken: 'an-access-token',
    account: { idTokenClaims: anEntraIdUser() },
  };
}

function getFailureTestCases() {
  return [
    {
      aTestCase: () => {
        const { accessToken: _accessToken, ...rest } = aValidPayload();
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
