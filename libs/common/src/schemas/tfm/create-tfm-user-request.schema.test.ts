import { withCreateTfmUserRequestSchemaTests } from '../../test-helpers';
import { CREATE_TFM_USER_REQUEST_SCHEMA } from './create-tfm-user-request.schema';

describe('CREATE_TFM_USER_REQUEST_SCHEMA', () => {
  withCreateTfmUserRequestSchemaTests({
    schema: CREATE_TFM_USER_REQUEST_SCHEMA,
  });
});
