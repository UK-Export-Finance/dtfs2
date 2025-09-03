export const MAINTENANCE = {
  /**
   * The maximum age (in seconds) used for cache control or session expiration.
   * @remarks
   * This constant is typically used to specify the retry after duration during
   * scheduled maintenance mode. Currently set to standard 1 hour.
   * @example
   * // Use MAX_AGE to set cache headers
   * res.setHeader('Retry-After', MAX_AGE);
   */
  MAX_AGE: '3600',
};
