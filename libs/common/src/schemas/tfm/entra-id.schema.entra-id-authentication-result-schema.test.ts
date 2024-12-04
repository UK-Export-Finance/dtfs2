import { anEntraIdUser, withSchemaValidationTests } from '../../test-helpers';
import { EntraIdUser } from '../../types';
import { EntraIdAuthenticationResult } from '../../types/tfm/entra-id';
import { ENTRA_ID_AUTHENTICATION_RESULT_SCHEMA } from './entra-id.schema';

describe('ENTRA_ID_AUTHENTICATION_RESULT_SCHEMA', () => {
  withSchemaValidationTests({
    schema: ENTRA_ID_AUTHENTICATION_RESULT_SCHEMA,
    aValidPayload,
    testCases: [
      {
        parameterPath: 'accessToken',
        type: 'string',
      },
      {
        parameterPath: 'account.idTokenClaims',
        type: 'ENTRA_ID_USER_SCHEMA',
        options: {
          overrideGetTestObjectWithUpdatedField: (newValue) => {
            const testObject = aValidPayload();
            testObject.account.idTokenClaims = newValue as EntraIdUser;
            return testObject;
          },
        },
      },
    ],
  });

  function aValidPayload(): EntraIdAuthenticationResult {
    return {
      accessToken: 'an-access-token',
      account: { idTokenClaims: anEntraIdUser() },
    };
  }
});
