/**
 * Represents the definition of a Swagger (OpenAPI) specification.
 *
 * @property openapi - The OpenAPI version, typically '3.0.0'. This is an optional property.
 * @property info - Metadata about the API, including title, version, and description.
 * @property components - Reusable OpenAPI components such as security schemes.
 * @property security - Default security requirements applied to documented operations.
 * @property tags - An array of tag objects used for grouping API endpoints.
 */
export interface swaggerDefinition {
  openapi?: '3.0.0';
  info: { title: string; version: string; description: string };
  components?: {
    securitySchemes?: Record<
      string,
      {
        type: 'apiKey';
        in: 'header';
        name: string;
        description?: string;
      }
    >;
  };
  security?: Array<Record<string, string[]>>;
  tags: Array<{
    name: string;
    description: string;
  }>;
}
