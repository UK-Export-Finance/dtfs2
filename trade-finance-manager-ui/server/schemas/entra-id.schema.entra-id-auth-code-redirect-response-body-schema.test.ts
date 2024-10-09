import { EntraIdAuthCodeRedirectResponseBody } from '../types/entra-id';
import { withSchemaTests } from '../../test-helpers';
import { EntraIdAuthCodeRedirectResponseBodySchema } from './entra-id.schema';

describe('EntraIdAuthCodeRedirectResponseBodySchema', () => {
  const aValidPayload: () => EntraIdAuthCodeRedirectResponseBody = () => ({
    code: 'a',
    client_info: 'b',
    state: 'c',
    session_state: 'd',
  });

  const failureTestCases = [
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { code, ...rest } = aValidPayload();
        return rest;
      },
      description: 'the code is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { state, ...rest } = aValidPayload();
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

  const successTestCases = [
    { aTestCase: aValidPayload, description: 'a complete valid payload is present' },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { client_info, ...rest } = aValidPayload();
        return rest;
      },
      description: 'the optional client_info is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { session_state, ...rest } = aValidPayload();
        return rest;
      },
      description: 'the optional session_state is missing',
    },
    {
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { client_info, session_state, ...rest } = aValidPayload();
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

  withSchemaTests({
    schema: EntraIdAuthCodeRedirectResponseBodySchema,
    failureTestCases,
    successTestCases,
  });
});
