import { ZodSchema } from 'zod';
import { withNumberTests } from './with-number.tests';
import { withObjectIdSchemaTests } from './with-object-id-schema.tests';
import { withStringTests } from './with-string.tests';
import { withTfmTeamSchemaTests } from './with-tfm-team-schema.tests';
import { withArrayTests, WithArrayTestsOptions } from './with-array.tests';
import { withIsoDateTimeStampSchemaTests } from './with-iso-date-time-stamp-schema.tests';
import { withAuditDatabaseRecordSchemaTests } from './with-audit-database-record-schema.tests';
import { withObjectIdOrObjectIdStringSchemaTests } from './with-object-id-or-object-id-string-schema.tests';
import { withObjectIdStringSchemaTests } from './with-object-id-string-schema.tests';
import { DefaultOptions } from './with-default-options.tests';
import { withBooleanTests } from './with-boolean.tests';

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
  | 'AUDIT_DATABASE_RECORD_SCHEMA';

type BaseTestCaseWithType<Type extends TestCaseTypes> = {
  type: Type;
  options?: Partial<DefaultOptions>;
};

type BaseTestCaseWithTypeRequiredOptions<Type extends TestCaseTypes, OptionsType> = BaseTestCaseWithType<Type> & {
  options: OptionsType;
};
export type TestCase =
  | BaseTestCaseWithType<'string'>
  | BaseTestCaseWithType<'number'>
  | BaseTestCaseWithType<'boolean'>
  | BaseTestCaseWithTypeRequiredOptions<'Array', WithArrayTestsOptions>
  | BaseTestCaseWithType<'TfmTeamSchema'>
  | BaseTestCaseWithType<'OBJECT_ID_SCHEMA'>
  | BaseTestCaseWithType<'OBJECT_ID_STRING_SCHEMA'>
  | BaseTestCaseWithType<'OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA'>
  | BaseTestCaseWithType<'ISO_DATE_TIME_STAMP_SCHEMA'>
  | BaseTestCaseWithType<'AUDIT_DATABASE_RECORD_SCHEMA'>;

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

    default:
      throw Error(`There are no existing test cases for the type ${type}`);
  }
};
