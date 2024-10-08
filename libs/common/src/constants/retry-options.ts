/**
 * Azure durable orchestrated functions retry options constants
 */
export const DURABLE_FUNCTIONS = {
  RETRY_OPTIONS: {
    /**
     * Retry intervals in millisecond (1000ms = 1s)
     * @constant {number}
     * @default 5000
     */
    INTERVAL_MS: 5000,
    /**
     * The maximum number retry attempts
     * @constant {number}
     * @default 5
     */
    MAX_RETRY: 5,
  },
} as const;
