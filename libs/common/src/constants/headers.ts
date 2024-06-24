/**
 * Represents the constant headers used in the application.
 */
export const HEADERS = {
  /**
   * Represents the content type header key.
   */
  CONTENT_TYPE: {
    KEY: 'Content-Type',
    /**
     * Represents the possible values for the content type header.
     */
    VALUES: {
      JSON: 'application/json',
      // Add more possible values here if needed
    },
  },
} as const;
