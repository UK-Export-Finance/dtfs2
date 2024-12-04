import { withSchemaValidationTests } from '../../test-helpers';
import { DecodedAuthCodeRequestState } from '../../types/tfm/entra-id';
import { DECODED_AUTH_CODE_REQUEST_STATE_SCHEMA } from './entra-id.schema';

describe('DECODED_AUTH_CODE_REQUEST_STATE_SCHEMA', () => {
  withSchemaValidationTests({
    schema: DECODED_AUTH_CODE_REQUEST_STATE_SCHEMA,
    failureTestCases: getFailureTestCases(),
    successTestCases: getSuccessTestCases(),
  });
});

function aValidPayload(): DecodedAuthCodeRequestState {
  return {
    csrfToken: 'a-csrf-token',
    successRedirect: 'a-success-redirect',
  };
}

function getFailureTestCases() {
  return [
    {
      aTestCase: () => {
        const { csrfToken: _csrfToken, ...rest } = aValidPayload();
        return rest;
      },
      description: 'the csrf token is missing',
    },
    {
      aTestCase: () => ({ ...aValidPayload(), csrfToken: 1 }),
      description: 'the csrf token is not a string',
    },
    {
      aTestCase: () => ({ ...aValidPayload(), successRedirect: 1 }),
      description: 'the successRedirect is not a string',
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
        const { successRedirect: _successRedirect, ...rest } = aValidPayload();
        return rest;
      },
      description: 'the optional success redirect is missing',
    },
    {
      aTestCase: () => ({ ...aValidPayload(), extraField: 'extra' }),
      description: 'there is an extra field',
    },
  ];
}
