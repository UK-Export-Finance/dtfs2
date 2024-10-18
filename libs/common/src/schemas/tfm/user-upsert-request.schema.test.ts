import { withUserUpsertRequestSchemaTests } from '../../test-helpers/schemas/with-user-upsert-request-schema.tests';
import { USER_UPSERT_REQUEST_SCHEMA } from './user-upsert-request.schema';

describe('USER_UPSERT_REQUEST_SCHEMA', () => {
  withUserUpsertRequestSchemaTests({
    schema: USER_UPSERT_REQUEST_SCHEMA,
    getTestObjectWithUpdatedUserUpsertRequestParams: (userUpsertRequest) => userUpsertRequest,
  });
});
