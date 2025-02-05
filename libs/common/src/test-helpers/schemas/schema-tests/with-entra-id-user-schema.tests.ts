import { ZodSchema } from 'zod';
import { anEntraIdUser } from '../../mock-data';
import { withDefaultOptionsTests } from '../primitive-types-tests';
import { withSchemaValidationTests } from '../with-schema-validation.tests';
import { WithSchemaTestParams } from '../with-schema-test.type';

export const withEntraIdUserSchemaTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedParameter,
  getUpdatedParameterFromParsedTestObject,
}: WithSchemaTestParams<Schema>) => {
  describe('with ENTRA_ID_USER_SCHEMA tests', () => {
    withDefaultOptionsTests({
      schema,
      getTestObjectWithUpdatedParameter,
      getUpdatedParameterFromParsedTestObject,
      options,
    });

    withSchemaValidationTests({
      schema,
      aValidPayload: () => anEntraIdUser(),
      testCases: [
        {
          parameterPath: 'oid',
          type: 'string',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) => getTestObjectWithUpdatedParameter({ ...aValidEntraIdUser(), oid: newValue }),
          },
        },
        {
          parameterPath: 'email',
          type: 'string',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) => getTestObjectWithUpdatedParameter({ ...aValidEntraIdUser(), email: newValue }),
          },
        },
        {
          parameterPath: 'given_name',
          type: 'string',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) => getTestObjectWithUpdatedParameter({ ...aValidEntraIdUser(), given_name: newValue }),
          },
        },
        {
          parameterPath: 'family_name',
          type: 'string',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) => getTestObjectWithUpdatedParameter({ ...aValidEntraIdUser(), family_name: newValue }),
          },
        },
        {
          parameterPath: 'roles',
          type: 'Array',
          options: {
            arrayTypeTestCase: {
              type: 'TfmTeamSchema',
            },
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) => getTestObjectWithUpdatedParameter({ ...aValidEntraIdUser(), roles: newValue }),
          },
        },
      ],
    });
  });

  function aValidEntraIdUser() {
    return anEntraIdUser();
  }
};
