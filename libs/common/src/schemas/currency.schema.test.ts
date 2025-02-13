import { withCurrencySchemaTests } from '../test-helpers/schemas';
import { CURRENCY_SCHEMA } from './currency.schema';

describe('CURRENCY_SCHEMA', () => {
  withCurrencySchemaTests({
    schema: CURRENCY_SCHEMA,
    getTestObjectWithUpdatedParameter: (newValue: unknown) => newValue,
    getUpdatedParameterFromParsedTestObject: (data) => data,
    options: { isOptional: false },
  });
});
