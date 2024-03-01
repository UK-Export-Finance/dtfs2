import { MOCK_USERS, ROLES } from '@ukef/dtfs2-common';

export const CYPRESS_ENV = {
  MOCK_USERS,
  ROLES,
} as const;

export type CypressEnvKey = keyof typeof CYPRESS_ENV;

export type CypressEnvVariable<Key extends CypressEnvKey> = (typeof CYPRESS_ENV)[Key];
