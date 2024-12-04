import { ObjectId } from 'mongodb';
import { withSchemaValidationTests } from '../../test-helpers';
import { TfmUser } from '../../types';
import { TFM_USER_SCHEMA } from './tfm-user.schema';
import { TEAM_IDS } from '../../constants';

describe('TFM_USER_SCHEMA', () => {
  withSchemaValidationTests({
    schema: TFM_USER_SCHEMA,
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
        parameterPath: 'lastLogin',
        type: 'UNIX_TIMESTAMP_MILLISECONDS_SCHEMA',
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

  function aValidPayload(): TfmUser {
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
