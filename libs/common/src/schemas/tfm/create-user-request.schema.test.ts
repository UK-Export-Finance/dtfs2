import { withCreateUserRequestSchemaTests } from '../../test-helpers';
import { CREATE_USER_REQUEST_SCHEMA } from './create-user-request.schema';

describe('CREATE_USER_REQUEST_SCHEMA', () => {
  withCreateUserRequestSchemaTests({
    schema: CREATE_USER_REQUEST_SCHEMA,
  });
});
