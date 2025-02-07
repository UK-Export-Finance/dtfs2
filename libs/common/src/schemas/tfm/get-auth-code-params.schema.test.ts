import { withSchemaValidationTests } from '../../test-helpers';
import { GetAuthCodeUrlParams } from '../../types';
import { GET_AUTH_CODE_PARAMS_SCHEMA } from './get-auth-code-params.schema';

describe('GET_AUTH_CODE_PARAMS_SCHEMA', () => {
  withSchemaValidationTests({
    schema: GET_AUTH_CODE_PARAMS_SCHEMA,
    aValidPayload,
    testCases: [
      {
        parameterPath: 'successRedirect',
        type: 'string',
      },
    ],
  });

  function aValidPayload(): GetAuthCodeUrlParams {
    return {
      successRedirect: 'a-success-redirect',
    };
  }
});
