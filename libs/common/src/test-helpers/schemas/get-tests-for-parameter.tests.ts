import { ZodSchema } from 'zod';
import {
  withUnixTimestampMillisecondsSchemaTests,
  withUnixTimestampSecondsSchemaTests,
  withUnixTimestampSchemaTests,
  withObjectIdSchemaTests,
  withObjectIdStringSchemaTests,
  withObjectIdOrObjectIdStringSchemaTests,
  withIsoDateTimeStampSchemaTests,
} from './custom-objects-tests';
import { DefaultOptions, WithArrayTestsOptions, withStringTests, withNumberTests, withBooleanTests, withArrayTests } from './primitive-object-tests';
import { withTfmTeamSchemaTests, withAuditDatabaseRecordSchemaTests, withEntraIdUserSchemaTests } from './schema-tests';

export type TestCaseTypes =
  | 'string'
  | 'number'
  | 'boolean'
  | 'Array'
  | 'TfmTeamSchema'
  | 'UNIX_TIMESTAMP_MILLISECONDS_SCHEMA'
  | 'UNIX_TIMESTAMP_SECONDS_SCHEMA'
  | 'UNIX_TIMESTAMP_SCHEMA'
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
  | TestCaseWithType<'UNIX_TIMESTAMP_MILLISECONDS_SCHEMA'>
  | TestCaseWithType<'UNIX_TIMESTAMP_SECONDS_SCHEMA'>
  | TestCaseWithType<'UNIX_TIMESTAMP_SCHEMA'>
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

    case 'UNIX_TIMESTAMP_MILLISECONDS_SCHEMA':
      withUnixTimestampMillisecondsSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedField,
      });
      break;

    case 'UNIX_TIMESTAMP_SECONDS_SCHEMA':
      withUnixTimestampSecondsSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedField,
      });
      break;

    case 'UNIX_TIMESTAMP_SCHEMA':
      withUnixTimestampSchemaTests({
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
