import { withCurrencySchemaTests } from '../test-helpers/schemas/custom-objects-tests/with-currency-schema.tests';
import { CURRENCY_SCHEMA } from './currency.schema';

describe('CURRENCY_SCHEMA', () => {
  withCurrencySchemaTests({
    schema: CURRENCY_SCHEMA,
    getTestObjectWithUpdatedParameter: (newValue: unknown) => newValue,
    options: { isOptional: false },
  });
});
