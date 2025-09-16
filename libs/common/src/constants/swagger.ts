/**
 * Swagger-related endpoint constants.
 *
 * @remarks
 * This object contains endpoints for accessing the Swagger UI and downloading the Swagger JSON specification.
 *
 * @property {object} ENDPOINTS - Contains endpoint paths for Swagger.
 * @property {string} ENDPOINTS.UI - Path to the Swagger UI.
 * @property {object} ENDPOINTS.DOWNLOAD - Contains endpoints for downloading Swagger specs.
 * @property {string} ENDPOINTS.DOWNLOAD.JSON - Path to download the Swagger JSON specification.
 */
export const SWAGGER = {
  ENDPOINTS: {
    UI: 'api-docs',
    DOWNLOAD: {
      JSON: '/api.json',
    },
  },
};
