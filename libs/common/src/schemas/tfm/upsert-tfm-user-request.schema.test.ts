import { TEAM_IDS } from '../../constants';
import { withSchemaValidationTests } from '../../test-helpers';
import { UpsertTfmUserRequest } from '../../types';
import { UPSERT_TFM_USER_REQUEST_SCHEMA } from './upsert-tfm-user-request.schema';

describe('UPSERT_TFM_USER_REQUEST_SCHEMA', () => {
  withSchemaValidationTests({
    schema: UPSERT_TFM_USER_REQUEST_SCHEMA,
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

  function aValidPayload(): UpsertTfmUserRequest {
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
