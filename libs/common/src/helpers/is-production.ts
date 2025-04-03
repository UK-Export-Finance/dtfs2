import { ENVIRONMENTS } from '../constants';

/**
 * Determines if the given environment is set to production.
 *
 * @param environment - The environment string to check.
 * @returns `true` if the environment is production, otherwise `false`.
 */
export const isProduction = (environment: string) => environment === ENVIRONMENTS.PRODUCTION;
