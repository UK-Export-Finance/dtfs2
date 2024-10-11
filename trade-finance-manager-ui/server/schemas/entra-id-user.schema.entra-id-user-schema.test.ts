import { EntraIdUserSchema } from './entra-id-user.schema';
import { withEntraIdUserSchemaTests } from './with-entra-id-user-schema.tests';

describe('EntraIdUserSchema', () => {
  withEntraIdUserSchemaTests({
    schema: EntraIdUserSchema,
    getTestObjectWithUpdatedUserParams: (entraIdUser) => entraIdUser,
  });
});
