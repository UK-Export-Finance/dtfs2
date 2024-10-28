import { withUpsertUserRequestSchemaTests } from '../../test-helpers';
import { UPSERT_USER_REQUEST_SCHEMA } from './upsert-user-request.schema';

describe('UPSERT_USER_REQUEST_SCHEMA', () => {
  withUpsertUserRequestSchemaTests({
    schema: UPSERT_USER_REQUEST_SCHEMA,
  });
});
