import { anEntraIdUser, withSchemaValidationTests } from '../../test-helpers';
import { EntraIdAuthenticationResult } from '../../types/tfm/entra-id';
import { ENTRA_ID_AUTHENTICATION_RESULT_SCHEMA } from './entra-id.schema';

describe('ENTRA_ID_AUTHENTICATION_RESULT_SCHEMA', () => {});

withSchemaValidationTests({
  schema: ENTRA_ID_AUTHENTICATION_RESULT_SCHEMA,
  aValidPayload,
  testCases: [
    {
      parameterPath: 'accessToken',
      type: 'string',
    },
    {
      parameterPath: 'account',
      type: 'ENTRA_ID_USER_SCHEMA',
    },
  ],
});

function aValidPayload(): EntraIdAuthenticationResult {
  return {
    accessToken: 'an-access-token',
    account: { idTokenClaims: anEntraIdUser() },
  };
}
