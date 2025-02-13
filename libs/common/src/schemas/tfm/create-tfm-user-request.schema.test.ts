import { TEAM_IDS } from '../../constants';
import { withSchemaValidationTests } from '../../test-helpers';
import { CreateTfmUserRequest } from '../../types';
import { CREATE_TFM_USER_REQUEST_SCHEMA } from './create-tfm-user-request.schema';

describe('CREATE_TFM_USER_REQUEST_SCHEMA', () => {
  withSchemaValidationTests({
    schema: CREATE_TFM_USER_REQUEST_SCHEMA,
    aValidPayload,
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
        parameterPath: 'teams',
        type: 'Array',
        options: {
          arrayTypeTestCase: {
            type: 'TfmTeamSchema',
          },
        },
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

  function aValidPayload(): CreateTfmUserRequest {
    return {
      username: 'test-user',
      email: 'test-user@test.com',
      teams: [TEAM_IDS.PIM],
      timezone: 'Europe/London',
      firstName: 'FirstName',
      lastName: 'LastName',
      azureOid: 'test-azure-oid',
    };
  }
});
