import { CypressEnvKey, CypressEnvVariable } from '../support/cypress-env';

export const getCypressEnvVariable = <Key extends CypressEnvKey>(cypressEnvKey: Key): CypressEnvVariable<Key> =>
  Cypress.env(cypressEnvKey) as CypressEnvVariable<Key>;
