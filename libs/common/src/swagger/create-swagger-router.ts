import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs, { Options } from 'swagger-jsdoc';
import { HEADERS, SWAGGER } from '../constants';
import { swaggerDefinition } from '../interfaces';

/**
 * Creates an Express router that serves Swagger API documentation.
 *
 * - Serves the OpenAPI JSON documentation at `/v1/api-docs/api.json`.
 * - Serves the Swagger UI at `/v1/api-docs` with custom configurations.
 *
 * @param definition - The Swagger/OpenAPI definition object.
 * @param apis - An array of file paths containing API documentation annotations.
 * @returns An Express router configured to serve Swagger documentation.
 */
export const swaggerRouter = (definition: swaggerDefinition, apis: Array<string>) => {
  const router = express.Router();

  const uiConfigurations = {
    explorer: true, // Show the “Explore” box to load a different URL
    swaggerOptions: {
      filter: true, // Add a search/filter input for endpoints
      persistAuthorization: true, // Keep auth data on page refresh
      displayRequestDuration: true, // Show API response times
    },
    customSiteTitle: definition.info.title, // Change the browser tab title
  };

  const options: Options = {
    swaggerDefinition: definition,
    apis,
  };

  const specifications = swaggerDocs(options);

  /**
   * Route: /v1/api-docs/api.json
   * Download as JSON
   */
  router.get(SWAGGER.ENDPOINTS.DOWNLOAD.JSON, (req, res) => {
    console.info('⚙️ Serving OpenAPI JSON documentation for %s request.', req.url);

    res.setHeader(HEADERS.CONTENT_TYPE.KEY, HEADERS.CONTENT_TYPE.VALUES.JSON);
    res.send(specifications);
  });

  /**
   * Route: /v1/api-docs
   * Below route serves Swagger UI as a catch-all middleware
   */
  router.use('/', swaggerUi.serve, swaggerUi.setup(specifications, uiConfigurations));

  return router;
};
