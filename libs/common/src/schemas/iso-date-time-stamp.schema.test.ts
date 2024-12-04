import { withIsoDateTimeStampSchemaTests } from '../test-helpers/schemas/primitives/with-iso-date-time-stamp-schema.tests';
import { ISO_DATE_TIME_STAMP_SCHEMA } from './iso-date-time-stamp.schema';

describe('ISO_DATE_TIME_STAMP_SCHEMA', () => {
  withIsoDateTimeStampSchemaTests({
    schema: ISO_DATE_TIME_STAMP_SCHEMA,
    getTestObjectWithUpdatedField: (newValue) => newValue,
  });
});
