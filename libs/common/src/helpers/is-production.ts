import { ENVIRONMENTS } from '../constants';

const { NODE_ENV } = process.env;

/**
 * Check if the current environment is production.
 * @returns {boolean} True if the environment is production, false otherwise.
 */
export const isProduction = (): boolean => NODE_ENV === ENVIRONMENTS.PRODUCTION;
