import { withSchemaTests } from '../../test-helpers';
import { EntraIdAuthCodeRedirectResponseBody } from '../../types/tfm/entra-id';
import { ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA } from './entra-id.schema';

describe('ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA', () => {
  withSchemaTests({
    schema: ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA,
    failureTestCases: getFailureTestCases(),
    successTestCases: getSuccessTestCases(),
  });
});

function aValidPayload(): EntraIdAuthCodeRedirectResponseBody {
  return { code: 'a-code', client_info: 'a-client-info', state: 'a-state', session_state: 'a-session-state' };
}

function getFailureTestCases() {
  return [
    {
      aTestCase: () => {
        const { code: _code, ...rest } = aValidPayload();
        return rest;
      },
      description: 'the code is missing',
    },
    {
      aTestCase: () => {
        const { state: _state, ...rest } = aValidPayload();
        return rest;
      },
      description: 'the state is missing',
    },
    {
      aTestCase: () => ({ ...aValidPayload(), code: 1 }),
      description: 'the code is not a string',
    },
    {
      aTestCase: () => ({ ...aValidPayload(), client_info: 1 }),
      description: 'the client_info is not a string',
    },
    {
      aTestCase: () => ({ ...aValidPayload(), state: 1 }),
      description: 'the state is not a string',
    },
    {
      aTestCase: () => ({ ...aValidPayload(), session_state: 1 }),
      description: 'the session_state is not a string',
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
      aTestCase: () => {
        const { client_info: _clientInfo, ...rest } = aValidPayload();
        return rest;
      },
      description: 'the optional client_info is missing',
    },
    {
      aTestCase: () => {
        const { session_state: _sessionState, ...rest } = aValidPayload();
        return rest;
      },
      description: 'the optional session_state is missing',
    },
    {
      aTestCase: () => {
        const { client_info: _clientInfo, session_state: _sessionState, ...rest } = aValidPayload();
        return rest;
      },
      description: 'the optional client_info and session_state is missing',
    },
    {
      aTestCase: () => {
        return { ...aValidPayload(), extraField: 'extra' };
      },
      description: 'there is an extra field',
    },
  ];
}
