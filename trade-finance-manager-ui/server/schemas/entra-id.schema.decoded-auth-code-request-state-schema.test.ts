import { withSchemaTests } from '@ukef/dtfs2-common';
import { DecodedAuthCodeRequestState } from '../types/entra-id';
import { DecodedAuthCodeRequestStateSchema } from './entra-id.schema';

describe('DecodedAuthCodeRequestStateSchema', () => {
  withSchemaTests({
    schema: DecodedAuthCodeRequestStateSchema,
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { csrfToken, ...rest } = aValidPayload();
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { successRedirect, ...rest } = aValidPayload();
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
