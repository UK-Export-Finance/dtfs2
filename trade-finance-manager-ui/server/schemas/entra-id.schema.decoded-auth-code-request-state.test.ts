import { DecodedAuthCodeRequestState } from '../types/entra-id';
import { withSchemaTests } from '../../test-helpers';
import { DecodedAuthCodeRequestStateSchema } from './entra-id.schema';

describe('DecodedAuthCodeRequestStateSchema', () => {
  const aValidPayload: () => DecodedAuthCodeRequestState = () => ({
    csrfToken: 'a',
    successRedirect: 'b',
  });

  const failureTestCases = [
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

  const successTestCases = [
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

  withSchemaTests({
    schema: DecodedAuthCodeRequestStateSchema,
    failureTestCases,
    successTestCases,
  });
});
