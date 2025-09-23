import { Express } from 'express';
import { isHttps } from '../is-https';

/**
 * Configures global settings for an Express application.
 *
 * @param application - The Express application instance to configure.
 */
export const configure = (application: Express) => {
  /**
   * Global Express application configurations
   */
  const https = isHttps();

  /**
   * If HTTPS is enabled then trust the first proxy
   * in front of the web application. Set to `1` on
   * cloud for `ui` microservices.
   */
  if (https) {
    application.set('trust proxy', 1);
  }
};
