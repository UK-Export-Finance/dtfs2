import { withSchemaValidationTests } from '../../test-helpers';
import { DecodedAuthCodeRequestState } from '../../types/tfm/entra-id';
import { DECODED_AUTH_CODE_REQUEST_STATE_SCHEMA } from './entra-id.schema';

describe('DECODED_AUTH_CODE_REQUEST_STATE_SCHEMA', () => {
  withSchemaValidationTests({
    schema: DECODED_AUTH_CODE_REQUEST_STATE_SCHEMA,
    aValidPayload,
    testCases: [
      {
        parameterPath: 'csrfToken',
        type: 'string',
      },
      {
        parameterPath: 'successRedirect',
        type: 'string',
        options: { isOptional: true },
      },
    ],
  });

  function aValidPayload(): DecodedAuthCodeRequestState {
    return {
      csrfToken: 'a-csrf-token',
      successRedirect: 'a-success-redirect',
    };
  }
});
