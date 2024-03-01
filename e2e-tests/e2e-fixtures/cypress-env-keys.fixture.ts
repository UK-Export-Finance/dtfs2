import { CypressEnvKey } from '../support/cypress-env';

export const CYPRESS_ENV_KEY: { [Key in CypressEnvKey]: Key } = {
  MOCK_USERS: 'MOCK_USERS',
  ROLES: 'ROLES',
} as const;
