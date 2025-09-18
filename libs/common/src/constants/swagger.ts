/**
 * Constants used for Swagger API documentation configuration.
 *
 * @remarks
 * This object contains endpoints for accessing the Swagger UI and downloading the API definition in JSON format,
 * as well as file path patterns for locating Swagger definition files in JavaScript and TypeScript.
 *
 * @property ENDPOINTS - Endpoints related to Swagger documentation.
 * @property ENDPOINTS.UI - Path to the Swagger UI.
 * @property ENDPOINTS.DOWNLOAD - Endpoints for downloading Swagger definitions.
 * @property ENDPOINTS.DOWNLOAD.JSON - Path to download the Swagger definition as a JSON file.
 * @property DEFINITIONS - File path patterns for Swagger definition files.
 * @property DEFINITIONS.PATHS - Paths for locating Swagger definition files.
 * @property DEFINITIONS.PATHS.JS - Glob pattern for JavaScript Swagger definition files.
 * @property DEFINITIONS.PATHS.TS - Glob pattern for TypeScript Swagger definition files.
 */
export const SWAGGER = {
  ENDPOINTS: {
    UI: 'api-docs',
    DOWNLOAD: {
      JSON: '/api.json',
    },
  },
  DEFINITIONS: {
    PATHS: {
      JS: '/**/swagger-definitions/**/*.js',
      TS: '/**/swagger-definitions/**/*.ts',
    },
  },
};
