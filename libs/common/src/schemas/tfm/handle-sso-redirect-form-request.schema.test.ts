import { aValidTfmSessionUser, withSchemaValidationTests } from '../../test-helpers/schemas';
import { HANDLE_SSO_REDIRECT_FORM_RESPONSE_SCHEMA } from './handle-sso-redirect-form-response.schema';

describe('HANDLE_SSO_REDIRECT_FORM_RESPONSE_SCHEMA', () => {
  withSchemaValidationTests({
    schema: HANDLE_SSO_REDIRECT_FORM_RESPONSE_SCHEMA,
    aValidPayload,
    testCases: [
      {
        parameterPath: 'user',
        type: 'TFM_SESSION_USER_SCHEMA',
        options: {
          overrideGetTestObjectWithUpdatedField: (newValue: unknown) => ({ ...aValidPayload(), user: newValue }),
        },
      },
      {
        parameterPath: 'token',
        type: 'string',
      },
      {
        parameterPath: 'expires',
        type: 'string',
      },
      {
        parameterPath: 'successRedirect',
        type: 'string',
        options: {
          isOptional: true,
        },
      },
    ],
  });

  function aValidPayload() {
    return { user: aValidTfmSessionUser(), token: 'a-token', expires: 'a-date', successRedirect: 'a-redirect' };
  }
});
