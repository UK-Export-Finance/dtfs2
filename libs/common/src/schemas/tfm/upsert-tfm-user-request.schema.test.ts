import { withUpsertTfmUserRequestSchemaTests } from '../../test-helpers';
import { UPSERT_TFM_USER_REQUEST_SCHEMA } from './upsert-tfm-user-request.schema';

describe('UPSERT_TFM_USER_REQUEST_SCHEMA', () => {
  withUpsertTfmUserRequestSchemaTests({
    schema: UPSERT_TFM_USER_REQUEST_SCHEMA,
  });
});
