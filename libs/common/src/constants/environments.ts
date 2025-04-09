/**
 * An object representing the different environments the application can run in.
 *
 * @constant
 * @property {string} DEVELOPMENT - Represents the development environment.
 * @property {string} STAGING - Represents the staging environment.
 * @property {string} PRODUCTION - Represents the production environment.
 */
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
} as const;
