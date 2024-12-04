import { ZodSchema } from 'zod';
import { withNumberTests } from './primitive-object-tests/with-number.tests';
import { withObjectIdSchemaTests } from './schema-tests/with-object-id-schema.tests';
import { withStringTests } from './primitive-object-tests/with-string.tests';
import { withTfmTeamSchemaTests } from './schema-tests/with-tfm-team-schema.tests';
import { withArrayTests, WithArrayTestsOptions } from './primitive-object-tests/with-array.tests';
import { withIsoDateTimeStampSchemaTests } from './schema-tests/with-iso-date-time-stamp-schema.tests';
import { withAuditDatabaseRecordSchemaTests } from './schema-tests/with-audit-database-record-schema.tests';
import { withObjectIdOrObjectIdStringSchemaTests } from './schema-tests/with-object-id-or-object-id-string-schema.tests';
import { withObjectIdStringSchemaTests } from './schema-tests/with-object-id-string-schema.tests';
import { DefaultOptions } from './primitive-object-tests/with-default-options.tests';
import { withBooleanTests } from './primitive-object-tests/with-boolean.tests';
import { withEntraIdUserSchemaTests } from './schema-tests/with-entra-id-user-schema.tests';

export type TestCaseTypes =
  | 'string'
  | 'number'
  | 'boolean'
  | 'Array'
  | 'TfmTeamSchema'
  | 'OBJECT_ID_SCHEMA'
  | 'OBJECT_ID_STRING_SCHEMA'
  | 'OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA'
  | 'ISO_DATE_TIME_STAMP_SCHEMA'
  | 'AUDIT_DATABASE_RECORD_SCHEMA'
  | 'ENTRA_ID_USER_SCHEMA';

type TestCaseWithType<Type extends TestCaseTypes> = {
  type: Type;
  options?: Partial<DefaultOptions>;
};

type TestCaseWithTypeAndRequiredOptions<Type extends TestCaseTypes, OptionsType> = TestCaseWithType<Type> & {
  options: OptionsType;
};
export type TestCase =
  | TestCaseWithType<'string'>
  | TestCaseWithType<'number'>
  | TestCaseWithType<'boolean'>
  | TestCaseWithTypeAndRequiredOptions<'Array', WithArrayTestsOptions>
  | TestCaseWithType<'TfmTeamSchema'>
  | TestCaseWithType<'OBJECT_ID_SCHEMA'>
  | TestCaseWithType<'OBJECT_ID_STRING_SCHEMA'>
  | TestCaseWithType<'OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA'>
  | TestCaseWithType<'ISO_DATE_TIME_STAMP_SCHEMA'>
  | TestCaseWithType<'AUDIT_DATABASE_RECORD_SCHEMA'>
  | TestCaseWithType<'ENTRA_ID_USER_SCHEMA'>;

export const getTestsForParameter = <Schema extends ZodSchema>({
  schema,
  testCase,
  getTestObjectWithUpdatedField,
}: {
  schema: Schema;
  testCase: TestCase;
  getTestObjectWithUpdatedField: (newValue: unknown) => unknown;
}) => {
  const { type, options } = testCase;

  switch (type) {
    case 'string':
      withStringTests({
        schema,
        options,
        getTestObjectWithUpdatedField,
      });
      break;

    case 'number':
      withNumberTests({
        schema,
        options,
        getTestObjectWithUpdatedField,
      });
      break;

    case 'boolean':
      withBooleanTests({
        schema,
        options,
        getTestObjectWithUpdatedField,
      });
      break;

    case 'Array':
      withArrayTests({
        schema,
        options,
        getTestObjectWithUpdatedField,
      });
      break;

    case 'TfmTeamSchema':
      withTfmTeamSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedField,
      });
      break;

    case 'OBJECT_ID_SCHEMA':
      withObjectIdSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedField,
      });
      break;

    case 'OBJECT_ID_STRING_SCHEMA':
      withObjectIdStringSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedField,
      });
      break;

    case 'OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA':
      withObjectIdOrObjectIdStringSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedField,
      });
      break;

    case 'ISO_DATE_TIME_STAMP_SCHEMA':
      withIsoDateTimeStampSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedField,
      });
      break;

    case 'AUDIT_DATABASE_RECORD_SCHEMA':
      withAuditDatabaseRecordSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedField,
      });
      break;

    case 'ENTRA_ID_USER_SCHEMA':
      withEntraIdUserSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedField,
      });
      break;

    default:
      throw Error(`There are no existing test cases for the type ${type}`);
  }
};
