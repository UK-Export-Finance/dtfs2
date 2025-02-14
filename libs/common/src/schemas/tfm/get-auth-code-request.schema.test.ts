import { withSchemaValidationTests } from '../../test-helpers/schemas';
import { GetAuthCodeUrlRequest } from '../../types';
import { GET_AUTH_CODE_REQUEST_SCHEMA } from './get-auth-code-request.schema';

describe('GET_AUTH_CODE_REQUEST_SCHEMA', () => {
  withSchemaValidationTests({
    schema: GET_AUTH_CODE_REQUEST_SCHEMA,
    aValidPayload,
    testCases: [
      {
        parameterPath: 'successRedirect',
        type: 'string',
      },
    ],
  });

  function aValidPayload(): GetAuthCodeUrlRequest {
    return {
      successRedirect: 'a-success-redirect',
    };
  }
});
