import { TEAM_IDS } from '../../constants';
import { withSchemaValidationTests } from '../../test-helpers';
import { CREATE_TFM_USER_REQUEST_SCHEMA } from './create-tfm-user-request.schema';

describe('CREATE_TFM_USER_REQUEST_SCHEMA', () => {
  withSchemaValidationTests({
    schema: CREATE_TFM_USER_REQUEST_SCHEMA,
    aValidPayload: () => ({
      username: 'username',
      email: 'email',
      teams: [TEAM_IDS.PIM],
      timezone: 'timezone',
      firstName: 'firstName',
      lastName: 'lastName',
      azureOid: 'azureOid',
    }),
    testCases: [
      {
        parameterPath: 'username',
        type: 'string',
      },
      {
        parameterPath: 'email',
        type: 'string',
      },
      {
        parameterPath: 'timezone',
        type: 'string',
      },
      {
        parameterPath: 'firstName',
        type: 'string',
      },
      {
        parameterPath: 'lastName',
        type: 'string',
      },
      {
        parameterPath: 'azureOid',
        type: 'string',
      },
    ],
  });
});
