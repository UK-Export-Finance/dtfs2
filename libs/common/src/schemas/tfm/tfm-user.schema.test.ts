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
    ],
  });

  // withTeamIdSchemaTests({
  //   parameterName: 'teams',
  //   schema: TFM_USER_SCHEMA,
  //   getTestObjectWithUpdatedField: (newValue) => ({ ...aValidPayload(), teams: newValue }),
  // });

  // withUnixTimestampMillisecondsSchemaTests({
  //   parameterName: 'lastLogin',
  //   schema: TFM_USER_SCHEMA,
  //   getTestObjectWithUpdatedField: (newValue) => ({ ...aValidPayload(), lastLogin: newValue }),
  // });

  //     withAuditDatabaseRecordSchemaTests({});
  //   withSchemaTests({
  //     schema: TFM_USER_SCHEMA,
  //     failureTestCases: getFailureTestCases(),
  //     successTestCases: getSuccessTestCases(),
  //   });

  function aValidPayload(): TfmUser {
    return {
      _id: new ObjectId(), // done
      username: 'test-user', // done
      email: 'test-user@test.com', // done
      teams: [TEAM_IDS.PIM], // done,
      timezone: 'Europe/London', // done
      firstName: 'FirstName', // done
      lastName: 'LastName', // done
      status: 'active', // done
      lastLogin: 1234567890123,
      sessionIdentifier: 'a-session-identifier', // done,
      auditRecord: {
        lastUpdatedAt: '2024-05-17T15:35:32.496 +00:00',
        lastUpdatedByIsSystem: true,
        lastUpdatedByPortalUserId: null,
        lastUpdatedByTfmUserId: null,
        noUserLoggedIn: null,
      },
      salt: 'a-salt', // done
      hash: 'a-hash', // done
      loginFailureCount: 0, // done
      azureOid: 'a-azure-oid', // done
    };
  }
});
