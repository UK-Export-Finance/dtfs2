/**
 * Represents the definition of a Swagger (OpenAPI) specification.
 *
 * @property openapi - The OpenAPI version, typically '3.0.0'. This is an optional property.
 * @property info - Metadata about the API, including title, version, and description.
 * @property tags - An array of tag objects used for grouping API endpoints.
 */
export interface swaggerDefinition {
  openapi?: '3.0.0';
  info: { title: string; version: string; description: string };
  tags: Array<{
    name: string;
    description: string;
  }>;
}
