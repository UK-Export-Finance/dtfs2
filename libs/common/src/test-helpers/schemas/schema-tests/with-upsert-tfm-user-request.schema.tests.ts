import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../with-schema-test.type';
import { withDefaultOptionsTests } from '../primitive-types-tests';
import { withSchemaValidationTests } from '../with-schema-validation.tests';
import { aUpsertTfmUserRequest } from '../../mock-data';

export const withUpsertTfmUserRequestSchemaTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedParameter,
  getUpdatedParameterFromParsedTestObject,
}: WithSchemaTestParams<Schema>) => {
  describe('with UPSERT_TFM_USER_REQUEST_SCHEMA tests', () => {
    withDefaultOptionsTests({
      schema,
      getTestObjectWithUpdatedParameter,
      getUpdatedParameterFromParsedTestObject,
      options,
    });

    withSchemaValidationTests({
      schema,
      aValidPayload: aUpsertTfmUserRequest,
      testCases: [
        {
          parameterPath: 'username',
          type: 'string',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) => getTestObjectWithUpdatedParameter({ ...aUpsertTfmUserRequest(), username: newValue }),
          },
        },
        {
          parameterPath: 'email',
          type: 'string',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) => getTestObjectWithUpdatedParameter({ ...aUpsertTfmUserRequest(), email: newValue }),
          },
        },
        {
          parameterPath: 'teams',
          type: 'Array',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) => getTestObjectWithUpdatedParameter({ ...aUpsertTfmUserRequest(), teams: newValue }),
            arrayTypeTestCase: {
              type: 'TfmTeamSchema',
            },
          },
        },
        {
          parameterPath: 'timezone',
          type: 'string',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) => getTestObjectWithUpdatedParameter({ ...aUpsertTfmUserRequest(), timezone: newValue }),
          },
        },
        {
          parameterPath: 'firstName',
          type: 'string',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) =>
              getTestObjectWithUpdatedParameter({ ...aUpsertTfmUserRequest(), firstName: newValue }),
          },
        },
        {
          parameterPath: 'lastName',
          type: 'string',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) => getTestObjectWithUpdatedParameter({ ...aUpsertTfmUserRequest(), lastName: newValue }),
          },
        },
        {
          parameterPath: 'azureOid',
          type: 'string',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) => getTestObjectWithUpdatedParameter({ ...aUpsertTfmUserRequest(), azureOid: newValue }),
          },
        },
      ],
    });
  });
};
