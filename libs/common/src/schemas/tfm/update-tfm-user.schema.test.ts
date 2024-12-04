import { ObjectId } from 'mongodb';
import { withSchemaValidationTests } from '../../test-helpers';
import { UpdateTfmUserRequest } from '../../types';
import { TEAM_IDS } from '../../constants';
import { UPDATE_TFM_USER_REQUEST_SCHEMA } from './update-tfm-user-request.schema';

describe('UPDATE_TFM_USER_SCHEMA', () => {
  withSchemaValidationTests({
    schema: UPDATE_TFM_USER_REQUEST_SCHEMA,
    schemaTestOptions: {
      isPartial: true,
    },
    aValidPayload,
    testCases: [
      {
        parameterPath: '_id',
        type: 'OBJECT_ID_SCHEMA',
      },
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
        parameterPath: 'status',
        type: 'string',
      },
      {
        parameterPath: 'sessionIdentifier',
        type: 'string',
        options: { isOptional: true },
      },
      {
        parameterPath: 'salt',
        type: 'string',
        options: { isOptional: true },
      },
      {
        parameterPath: 'hash',
        type: 'string',
        options: { isOptional: true },
      },
      {
        parameterPath: 'loginFailureCount',
        type: 'number',
        options: { isOptional: true },
      },
      {
        parameterPath: 'azureOid',
        type: 'string',
        options: { isOptional: true },
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
        parameterPath: 'auditRecord',
        type: 'AUDIT_DATABASE_RECORD_SCHEMA',
        options: { isOptional: true },
      },
    ],
  });

  function aValidPayload(): UpdateTfmUserRequest {
    return {
      _id: new ObjectId(),
      username: 'test-user',
      email: 'test-user@test.com',
      teams: [TEAM_IDS.PIM],
      timezone: 'Europe/London',
      firstName: 'FirstName',
      lastName: 'LastName',
      status: 'active',
      lastLogin: 1234567890123,
      sessionIdentifier: 'a-session-identifier',
      auditRecord: {
        lastUpdatedAt: '2024-05-17T15:35:32.496 +00:00',
        lastUpdatedByIsSystem: true,
        lastUpdatedByPortalUserId: null,
        lastUpdatedByTfmUserId: null,
        noUserLoggedIn: null,
      },
      salt: 'a-salt',
      hash: 'a-hash',
      loginFailureCount: 0,
      azureOid: 'a-azure-oid',
    };
  }
});
