import { ZodSchema } from 'zod';
import { anEntraIdUser } from '../../mock-data';
import { withDefaultOptionsTests } from '../primitive-object-tests';
import { withSchemaValidationTests } from '../with-schema-validation.tests';
import { WithSchemaTestParams } from '../with-schema-test.type';

export const withEntraIdUserSchemaTests = <Schema extends ZodSchema>({ schema, options = {}, getTestObjectWithUpdatedField }: WithSchemaTestParams<Schema>) => {
  describe('with ENTRA_ID_USER_SCHEMA tests', () => {
    withDefaultOptionsTests({
      schema,
      getTestObjectWithUpdatedField,
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
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) => getTestObjectWithUpdatedField({ ...aValidEntraIdUser(), oid: newValue }),
          },
        },
        {
          parameterPath: 'verified_primary_email',
          type: 'Array',
          options: {
            arrayTypeTestCase: {
              type: 'string',
            },
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) =>
              getTestObjectWithUpdatedField({ ...aValidEntraIdUser(), verified_primary_email: newValue }),
            isAllowEmpty: false,
          },
        },
        {
          parameterPath: 'verified_secondary_email',
          type: 'Array',
          options: {
            arrayTypeTestCase: {
              type: 'string',
            },
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) =>
              getTestObjectWithUpdatedField({ ...aValidEntraIdUser(), verified_secondary_email: newValue }),
          },
        },
        {
          parameterPath: 'given_name',
          type: 'string',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) => getTestObjectWithUpdatedField({ ...aValidEntraIdUser(), given_name: newValue }),
          },
        },
        {
          parameterPath: 'family_name',
          type: 'string',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) => getTestObjectWithUpdatedField({ ...aValidEntraIdUser(), family_name: newValue }),
          },
        },
        {
          parameterPath: 'roles',
          type: 'Array',
          options: {
            arrayTypeTestCase: {
              type: 'TfmTeamSchema',
            },
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) => getTestObjectWithUpdatedField({ ...aValidEntraIdUser(), roles: newValue }),
          },
        },
      ],
    });
  });

  function aValidEntraIdUser() {
    return anEntraIdUser();
  }
};
