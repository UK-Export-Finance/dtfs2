import { withSchemaValidationTests } from '../../test-helpers';
import { EntraIdAuthCodeRedirectResponseBody } from '../../types/tfm/entra-id';
import { ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA } from './entra-id.schema';

describe('ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA', () => {
  withSchemaValidationTests({
    schema: ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA,
    aValidPayload,
    testCases: [
      {
        parameterPath: 'code',
        type: 'string',
      },
      {
        parameterPath: 'client_info',
        type: 'string',
        options: { isOptional: true },
      },
      {
        parameterPath: 'state',
        type: 'string',
      },
      {
        parameterPath: 'session_state',
        type: 'string',
        options: { isOptional: true },
      },
    ],
  });
});

function aValidPayload(): EntraIdAuthCodeRedirectResponseBody {
  return { code: 'a-code', client_info: 'a-client-info', state: 'a-state', session_state: 'a-session-state' };
}
