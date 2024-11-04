import { UPSERT_TFM_USER_REQUEST_SCHEMA } from '@ukef/dtfs2-common/schemas';
import { withUpsertTfmUserRequestSchemaTests } from '@ukef/dtfs2-common';

describe('validatePutTfmUserPayload', () => {
  withUpsertTfmUserRequestSchemaTests({
    schema: UPSERT_TFM_USER_REQUEST_SCHEMA,
  });
});
