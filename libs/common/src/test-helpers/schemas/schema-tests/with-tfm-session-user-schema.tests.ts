import { ZodSchema } from 'zod';
import { ObjectId } from 'mongodb';
import { WithSchemaTestParams } from '../with-schema-test.type';
import { TEAM_IDS } from '../../../constants';
import { withSchemaValidationTests } from '../with-schema-validation.tests';
import { withDefaultOptionsTests } from '../primitive-types-tests';

export const withTfmSessionUserSchemaTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedParameter,
}: WithSchemaTestParams<Schema>) => {
  describe('with TFM_SESSION_USER_SCHEMA tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedParameter,
    });

    withSchemaValidationTests({
      schema,
      aValidPayload,
      testCases: [
        {
          parameterPath: '_id',
          type: 'OBJECT_ID_STRING_SCHEMA',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue) => getTestObjectWithUpdatedParameter({ ...aValidPayload(), _id: newValue }),
          },
        },
        {
          parameterPath: 'username',
          type: 'string',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue) => getTestObjectWithUpdatedParameter({ ...aValidPayload(), username: newValue }),
          },
        },
        {
          parameterPath: 'email',
          type: 'string',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue) => getTestObjectWithUpdatedParameter({ ...aValidPayload(), email: newValue }),
          },
        },
        {
          parameterPath: 'timezone',
          type: 'string',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue) => getTestObjectWithUpdatedParameter({ ...aValidPayload(), timezone: newValue }),
          },
        },
        {
          parameterPath: 'firstName',
          type: 'string',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue) => getTestObjectWithUpdatedParameter({ ...aValidPayload(), firstName: newValue }),
          },
        },
        {
          parameterPath: 'lastName',
          type: 'string',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue) => getTestObjectWithUpdatedParameter({ ...aValidPayload(), lastName: newValue }),
          },
        },
        {
          parameterPath: 'status',
          type: 'string',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue) => getTestObjectWithUpdatedParameter({ ...aValidPayload(), status: newValue }),
          },
        },
        {
          parameterPath: 'lastLogin',
          type: 'UNIX_TIMESTAMP_MILLISECONDS_SCHEMA',
          options: {
            isOptional: true,
            overrideGetTestObjectWithUpdatedField: (newValue) => getTestObjectWithUpdatedParameter({ ...aValidPayload(), lastLogin: newValue }),
          },
        },
        {
          parameterPath: 'teams',
          type: 'Array',
          options: {
            arrayTypeTestCase: {
              type: 'TfmTeamSchema',
            },
            overrideGetTestObjectWithUpdatedField: (newValue) => getTestObjectWithUpdatedParameter({ ...aValidPayload(), teams: newValue }),
          },
        },
      ],
    });

    function aValidPayload() {
      return aValidTfmSessionUser();
    }
  });
};

export function aValidTfmSessionUser() {
  return {
    _id: new ObjectId().toString(),
    username: 'test-user',
    email: 'test-user@test.com',
    teams: [TEAM_IDS.PIM],
    timezone: 'Europe/London',
    firstName: 'FirstName',
    lastName: 'LastName',
    status: 'active',
    lastLogin: 1234567890123,
  };
}
