import dotenv from 'dotenv';
import { stringToBoolean } from './string-to-boolean';

dotenv.config();

/**
 * Determines if maintenance mode is currently active based on the `MAINTENANCE_ACTIVE` environment variable.
 * Converts the environment variable to a boolean value using `stringToBoolean`.
 *
 * @returns {boolean} `true` if maintenance mode is active, otherwise `false`.
 */
export const isMaintenanceActive = () => {
  const { MAINTENANCE_ACTIVE } = process.env;
  const value = stringToBoolean(String(MAINTENANCE_ACTIVE));

  return Boolean(value);
};
